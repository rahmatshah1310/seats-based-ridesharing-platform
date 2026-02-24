import "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
    rawBody?: Buffer;
    files?: {
      profileImage?: Express.Multer.File[];
      vehicleImages?: Express.Multer.File[];
      // or [field: string]: Express.Multer.File[];
    } | Express.Multer.File[];
  }
}
