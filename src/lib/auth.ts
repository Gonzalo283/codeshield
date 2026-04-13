import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import { db } from "./db";
import { log } from "./logger";
import { sendEmail, emailTemplates } from "./email";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user?.id) {
        token.id = user.id;
      } else if (profile && !token.id) {
        // GitHub profile.id is a number
        const gh = profile as { id?: number | string; sub?: string };
        token.id = String(gh.sub || gh.id || "");
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      if (session.user) {
        // Look up the DB user by email to get a stable cuid id
        if (session.user.email) {
          const dbUser = await db.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
          });
          session.user.id = dbUser?.id || token.sub || "";
        } else {
          session.user.id = token.sub || "";
        }
      }
      return session;
    },
    async signIn({ user, profile }) {
      // Track github id for signed-in user (first time)
      if (profile && user.email) {
        try {
          const gh = profile as { id?: number | string };
          const githubId = gh.id ? String(gh.id) : null;
          if (githubId) {
            await db.user.updateMany({
              where: { email: user.email },
              data: { githubId },
            });
          }
        } catch (e) {
          log.warn("Could not persist githubId", { error: String(e) });
        }
      }
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      // Fires ONCE per user — on first GitHub signin with PrismaAdapter
      if (!user.email) return;
      try {
        await sendEmail({
          to: user.email,
          ...emailTemplates.welcome(user.name || ""),
        });
        log.info("welcome-email-sent", { userId: user.id, email: user.email });
      } catch (e) {
        log.warn("welcome-email-failed", { userId: user.id, error: String(e) });
      }
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
};
