import { db } from "@/db/db";
import { eq, avg, count, and } from "drizzle-orm";
import type { CreateRatingInput } from "@/db/types/rating.types";
import { ratings } from "@/db/schema/rating.model";
import { users } from "@/db/schema/user.model";
import { driverProfiles } from "@/db/schema/driverProfile.model";
import { AppError } from "@/helpers/appError";

export const createRating = async (ratingData: CreateRatingInput) => {
    try {
        return await db.transaction(async (tx) => {
            // 1. Insert the new rating
            const [newRating] = await tx
                .insert(ratings)
                .values(ratingData)
                .returning();

            if (!newRating) {
                throw new AppError("Failed to create rating", 500);
            }


            const [ratingWithRater] = await tx
                .select({
                    id: ratings.id,
                    score: ratings.score,
                    comment: ratings.comment,
                    rideId: ratings.rideId,
                    rater: {
                        id: users.id,
                        name: users.name,
                        phone: users.phone,
                        profileImage: users.profileImage,
                    },
                })
                .from(ratings)
                .leftJoin(users, eq(users.id, ratings.raterId))
                .where(eq(ratings.id, newRating.id));


            // 2. Fetch all ratings for the ratee to calculate new average and count
            const [stats] = await tx
                .select({
                    average: avg(ratings.score),
                    total: count(ratings.id),
                })
                .from(ratings)
                .where(eq(ratings.rateeId, ratingData.rateeId));

            const averageRating = parseFloat(stats?.average || "0");
            const totalRatings = Number(stats?.total || 0);

            // 3. Update the users table
            await tx
                .update(users)
                .set({
                    averageRating: Math.round(averageRating), // users table uses integer for averageRating
                    totalRatings: totalRatings,
                })
                .where(eq(users.id, ratingData.rateeId));

            // 4. Update driver profile if the user is a driver
            await tx
                .update(driverProfiles)
                .set({
                    ratingAverage: averageRating.toFixed(1), // driver_profiles uses numeric(2,1)
                    ratingCount: totalRatings,
                })
                .where(eq(driverProfiles.userId, ratingData.rateeId));

            return ratingWithRater;;
        });
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("Error creating rating:", error);
        throw new AppError("Failed to create rating", 500);
    }
};


export const deleteRating = async (
    raterId: string,
    ratingId: string
) => {
    try {
        return await db.transaction(async (tx) => {

            const [deletedRating] = await tx
                .delete(ratings)
                .where(
                    and(
                        eq(ratings.id, ratingId),
                        eq(ratings.raterId, raterId)
                    )
                )
                .returning();

            if (!deletedRating) {
                throw new AppError("Rating not found", 404);
            }

            const [stats] = await tx
                .select({
                    average: avg(ratings.score),
                    total: count(ratings.id),
                })
                .from(ratings)
                .where(eq(ratings.rateeId, deletedRating.rateeId));

            const averageRating = parseFloat(stats?.average || "0");
            const totalRatings = Number(stats?.total || 0);

            await tx
                .update(users)
                .set({
                    averageRating: Math.round(averageRating),
                    totalRatings,
                })
                .where(eq(users.id, deletedRating.rateeId));

            await tx
                .update(driverProfiles)
                .set({
                    ratingAverage: averageRating.toFixed(1),
                    ratingCount: totalRatings,
                })
                .where(eq(driverProfiles.userId, deletedRating.rateeId));

            return deletedRating;
        });
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("Error deleting rating:", error);
        throw new AppError("Failed to delete rating", 500);
    }
};
