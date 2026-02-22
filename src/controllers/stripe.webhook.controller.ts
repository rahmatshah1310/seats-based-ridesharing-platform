import { stripe } from "@/libs/stripe";
import { db } from "@/db/db";
import { users, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";

export const stripeWebhookController = async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
        console.error("Stripe Webhook Error: Missing signature or secret");
        return res.status(400).send("Webhook Error: Missing signature or secret");
    }

    let event;

    try {
        // Note: req.body MUST be the raw buffer for this to work
        event = stripe.webhooks.constructEvent(
            (req as any).rawBody || req.body,
            sig,
            webhookSecret
        );
    } catch (err: any) {
        console.error(`Stripe Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as any;
                const customerId = session.customer;

                // Update subscription status in users table
                await db.update(users)
                    .set({ subscriptionStatus: "active", provider: "stripe" })
                    .where(eq(users.stripeCustomerId, customerId));

                // Insert into payments table
                const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));
                if (user) {
                    await db.insert(payments).values({
                        userId: user.id,
                        providerTransactionId: session.id,
                        amount: session.amount_total,
                        status: "succeeded",
                        provider: "stripe",
                    });
                }
                break;
            }

            case "invoice.paid": {
                const invoice = event.data.object as any;
                const customerId = invoice.customer;

                await db.update(users)
                    .set({ subscriptionStatus: "active" })
                    .where(eq(users.stripeCustomerId, customerId));
                break;
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as any;
                const customerId = invoice.customer;

                await db.update(users)
                    .set({ subscriptionStatus: "past_due" })
                    .where(eq(users.stripeCustomerId, customerId));
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as any;
                const customerId = subscription.customer;

                await db.update(users)
                    .set({ subscriptionStatus: "canceled" })
                    .where(eq(users.stripeCustomerId, customerId));
                break;
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.error("Stripe Webhook Processing Error:", error);
        res.status(500).send("Internal Server Error");
    }
};
