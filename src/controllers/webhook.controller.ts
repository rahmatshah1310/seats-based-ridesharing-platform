import { db } from "@/db/db";
import { driverProfiles } from "@/db/schema";
import type { Controller } from "@/db/types/controller";
import type { ResponseWithHelpers } from "@/middlewares/response.mw";
import { eq } from "drizzle-orm";

export const jotformWebhookController: Controller = async (req, res) => {
    const r = res as ResponseWithHelpers;

    try {
        const rawRequestString = req.body.rawRequest;

        if (!rawRequestString) {
            console.error("Jotform Webhook: Missing rawRequest");
            return r.fail("Missing rawRequest", 400);
        }

        const rawRequest = JSON.parse(rawRequestString);

        const userId = rawRequest.q3_userId?.trim();
        const cnic = rawRequest.q4_cnic?.trim();
        const licenseNumber = rawRequest.q5_licenseNumber?.trim();
        const vehicleName = rawRequest.q6_vehicleName?.trim();

        if (!userId) {
            console.error("Jotform Webhook: Missing userId in rawRequest");
            return r.fail("Missing userId in submission", 400);
        }

        // 1. Perform update and capture the result using .returning()
        const updatedProfiles = await db.update(driverProfiles)
            .set({
                cnic,
                licenseNumber,
                vehicleName,
                isComplete: true,
                appliedAt: new Date(),
                verificationStatus: "pending"
            })
            .where(eq(driverProfiles.userId, userId))
            .returning(); // This makes the query return an array of the updated row(s)

        // 2. Check if any row was actually updated
        if (updatedProfiles.length === 0) {
            console.error(`Jotform Webhook: No driver profile found for userId: ${userId}`);
            // We return a 404 so you can see the error in Jotform's logs
            return r.fail("Driver profile not found in database", 404);
        }

        console.log(`Jotform Webhook: Driver profile updated for user ${userId}`);

        return r.success(updatedProfiles[0], "Webhook processed successfully");

    } catch (error: any) {
        console.error("Jotform Webhook Error:", error);

        if (error.code === "23505") {
            return r.fail("Constraint error: CNIC or License Number already exists", 400);
        }

        return r.serverError(error);
    }
};