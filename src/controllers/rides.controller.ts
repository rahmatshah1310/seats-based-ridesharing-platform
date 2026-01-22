import { createRide } from "@/services/rides.service";
import type { Controller } from "@/db/types/controller";
import type { ResponseWithHelpers } from "@/middlewares/response.mw";
import type { CreateRideInput } from "@/db/types/rides.types";


export const createRideController:Controller=async(req,res)=>{
    const r = res as ResponseWithHelpers;
    try {

        const {userId}=req.user._id;
        const rideData:CreateRideInput={
            driverId:req.body.driverId,
            vehicleId:req.body.vehicleId,
            from:req.body.from,
            to:req.body.to,
            departureTime:req.body.departureTime,
            availableSeats:req.body.availableSeats,
            bookedSeats:req.body.bookedSeats,
        }
        const ride=await createRide(rideData);
        return r.success(ride, "Ride created successfully");
    } catch (error) {
        console.error("RidesController [createRideController] Error:", error);
        r.serverError(error);
    }
}