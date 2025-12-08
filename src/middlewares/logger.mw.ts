import type { Request, Response, NextFunction } from "express";

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);

  switch (req.method) {
    case "GET":
    case "DELETE":
      if (req.params && Object.keys(req.params).length) {
        // console.log("Params:", req.params);
      }
      if (req.query && Object.keys(req.query).length) {
        // console.log("Query:", req.query);
      }
      break;
    case "POST":
    case "PUT":
      if (req.body && Object.keys(req.body).length) {
        // console.log("Body:", req.body);
      }
      break;
    default:
      break;
  }

  next();
};
