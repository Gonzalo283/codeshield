// Usage: npm run db:seed
// Creates a demo user + API key for local testing.

import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const db = new PrismaClient();

function hash(key: string) {
  return crypto.createHash("sha256").update(key).digest("hex");
}

async function main() {
  const email = "demo@codeshield.sh";

  const user = await db.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Demo User",
    },
  });

  // Seed a key if none exists
  const rawKey = `cs_test_${crypto.randomBytes(16).toString("hex")}`;
  const existingKeys = await db.apiKey.count({ where: { userId: user.id } });

  if (existingKeys === 0) {
    await db.apiKey.create({
      data: {
        userId: user.id,
        name: "Seed key",
        prefix: "cs_test_",
        last4: rawKey.slice(-4),
        keyHash: hash(rawKey),
        plan: "free",
        scansUsed: 0,
        resetAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      },
    });
    console.log(`\n✅ Seed user: ${email}`);
    console.log(`🔑 API key (save it — hashed after this): ${rawKey}\n`);
  } else {
    console.log(`\n✅ Seed user already exists: ${email}\n`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
