import { stripe } from "@/libs/stripe";
import { db } from "@/db/db";
import { driverProfiles, users } from "@/db/schema"; // Added 'users'
import { eq } from "drizzle-orm";
import type { Controller } from "@/db/types/controller";
import type { ResponseWithHelpers } from "@/middlewares/response.mw";

export const createCheckoutSession: Controller = async (req, res) => {
    const r = res as ResponseWithHelpers;
    try {
        const userId = req.user?._id;
        if (!userId) {
            return r.fail("Unauthorized", 401);
        }

        // Fetch user profile to get stripeCustomerId and email
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!user) {
            return r.fail("User not found", 404);
        }

        let stripeCustomerId = user.stripeCustomerId;

        if (!stripeCustomerId) {
            // Lazy initialization: Create Stripe customer if missing
            if (!user.email) {
                return r.fail("Your email is missing. Please update your profile with an email address.", 400);
            }

            try {
                const customer = await stripe.customers.create({
                    email: user.email,
                    name: user.name,
                    metadata: { userId: user.id },
                });

                stripeCustomerId = customer.id;

                // Save to database
                await db.update(users)
                    .set({ stripeCustomerId: customer.id })
                    .where(eq(users.id, userId));
            } catch (stripeError) {
                console.error("Stripe Lazy Creation Error:", stripeError);
                return r.fail("Failed to initialize Stripe customer. Please try again later.", 500);
            }
        }

        const { priceId } = req.body;
        if (!priceId) {
            return r.fail("Price ID is required", 400);
        }

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            customer: stripeCustomerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${req.protocol}://${req.get("host")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.protocol}://${req.get("host")}/payment-cancel`,
        });

        return r.success({ url: session.url }, "Checkout session created successfully");
    } catch (error) {
        console.error("PaymentController [createCheckoutSession] Error:", error);
        return r.serverError(error);
    }
};
