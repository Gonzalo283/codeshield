import { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { persistSubscription } from "@/lib/subscriptions";
import { sendEmail, emailTemplates } from "@/lib/email";
import { db } from "@/lib/db";
import { log } from "@/lib/logger";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    log.error("Webhook signature verification failed", err as Error);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id;
        const userId = session.metadata?.userId || null;

        // Link customer to user if available
        if (userId && customerId) {
          await db.user.update({
            where: { id: userId },
            data: { stripeCustomerId: customerId },
          }).catch(() => {
            // User might not exist yet — ignore
          });
        }

        // Fetch the subscription and persist
        if (session.subscription) {
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const subscription = await getStripe().subscriptions.retrieve(subId);
          const result = await persistSubscription(subscription, userId);

          // Transactional email: welcome to paid plan
          if (session.customer_email && result) {
            await sendEmail({
              to: session.customer_email,
              ...emailTemplates.subscriptionActivated(result.planId),
            });
          }
        }

        log.info("Checkout completed", {
          email: session.customer_email,
          planId: session.metadata?.planId,
        });
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await persistSubscription(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await persistSubscription(subscription);
        log.info("Subscription cancelled", { subscriptionId: subscription.id });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        log.warn("Payment failed", { customerId, invoiceId: invoice.id });

        // Notify user
        if (invoice.customer_email && customerId) {
          await sendEmail({
            to: invoice.customer_email,
            ...emailTemplates.paymentFailed(invoice.hosted_invoice_url || null),
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        log.info("Payment succeeded", { customerId: invoice.customer, invoiceId: invoice.id });
        break;
      }

      default:
        log.debug("Unhandled Stripe event", { type: event.type });
    }

    return Response.json({ received: true });
  } catch (err) {
    log.error("Webhook handler error", err as Error);
    return Response.json({ error: "handler_error" }, { status: 500 });
  }
}
