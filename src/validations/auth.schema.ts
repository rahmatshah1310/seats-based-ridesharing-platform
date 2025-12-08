import { roleEnum } from "@/db/schema/enums";
import Joi from "joi";

// Extract enum values for validation
const roleValues = ["admin", "passenger", "driver"] as const;

export const registerUserSchema=Joi.object({
    name:Joi.string().min(3).max(80).required().messages({
        "string.empty":"Please enter your name",
        "string.min":"Name must be at least 3 characters long",
        "string.max":"Name must be less than 80 charactes long"
    }),
    phone:Joi.string().pattern(/^03\d{9}|92\d{9}$/).required().messages({
        "string.empty":"Please enter your phone number",
        "string.pattern":"Phone number must start with 03 or 92"
    }),
    role:Joi.string().valid(...roleValues)
        .required()
        .messages({
            "string.empty":"Please select a role",
            "string.required":"Please select a role",
            "any.only":"Invalid role"
        }),
    cnic:Joi.string().pattern(/^\d{13}$/).required().messages({
        "string.empty":"CNIC is required",
        "string.pattern":"CNIC must be 13 digits long"
    }),
    profileImage: Joi.string()
  .max(120)
  .optional()
  .messages({
    "any.required": "Profile image is required",
    "string.max": "Profile image must be less than 120 characters",
  }),
    city:Joi.string().max(120).when("role",{is:"passenger",then:Joi.required(),otherwise:Joi.forbidden().messages({"any.required":"City is required for passenger"})}),
    district:Joi.string().max(120).when("role",{is:"passenger",then:Joi.required(),otherwise:Joi.forbidden().messages({"any.required":"District  is required for passenger"})}),
    country:Joi.string().max(120).when("role",{is:"passenger",then:Joi.required(),otherwise:Joi.forbidden().messages({"any.required":"Country is required for passenger"})}),
    licenseNumber:Joi.string().max(120).when("role",{is:"driver",then:Joi.required(),otherwise:Joi.forbidden().messages({"any.required":"LicenseNumber is required for passenger"})}),
    vehicleColor:Joi.string().max(120).when("role",{is:"driver",then:Joi.required(),otherwise:Joi.forbidden().messages({"any.required":"VehicleColor is required for passenger"})}),
    vehicleModel:Joi.string().max(120).when("role",{is:"driver",then:Joi.required(),otherwise:Joi.forbidden().messages({"any.required":"VehicleModel is required for passenger"})}),
    vehicleName:Joi.string().max(120).when("role",{is:"driver",then:Joi.required(),otherwise:Joi.forbidden().messages({"any.required":"VehicleName is required for passenger"})}),
    vehicleNumberPlate:Joi.string().max(120).when("role",{is:"driver",then:Joi.required(),otherwise:Joi.forbidden().messages({"any.required":"VehicleNumberPlate is required for passenger"})}),
    licenseExpiry:Joi.date().when("role",{is:"driver",then:Joi.required(),otherwise:Joi.forbidden().messages({"any.required":"LicenseExpiry is required for passenger"})}),
    vehicleImages:Joi.array().items(Joi.string()).max(10).when("role",{is:"driver",then:Joi.required(),otherwise:Joi.forbidden().messages({"any.required":"VehicleImages is required for driver"})}),

})

export const login=Joi.object({
    phone:Joi.string().pattern(/^03\d{9}|92\d{9}$/).required().messages({
        "string.empty":"Please enter your phone number",
        "string.pattern":"Phone number must start with 03 or 92"
    }),
})


export const copleteProfile=Joi.object({

})