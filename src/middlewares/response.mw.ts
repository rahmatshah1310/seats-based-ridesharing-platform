import type { Request, Response, NextFunction, RequestHandler } from "express";

export type ResponseWithHelpers = Response & {
  success: (data: any, message?: string) => void;
  serverError: (error: any) => void;
  fail: (data: any, statusCode?: number) => void;
  unprocessable: (message: string, details?: Record<string, unknown>) => void;
  sendResponse: (statusCode: number, data: any) => void;
};

export const responseMiddleware: RequestHandler = (
  req: Request,
  res,
  next: NextFunction,
) => {
  const r = res as ResponseWithHelpers;

  r.success = (data: any, message?: string) => {
    const succesMessage = message;
    res.status(200).json({
      status: "success",
      message: succesMessage,
      data,
    });
  };

  r.serverError = (error: any) => {
    if (error?.isJoi) {
      let data = error.details.map((d: any) => d.message);
      data = data.join(", ");
      console.log(`Error:[${req.method}-${req.url}] ${data}`);
      res.status(400).json({ status: "fail", data });
    } else {
      console.log(`Error:[${req.method}-${req.url}] ${error}`);
      res
        .status(500)
        .json({ status: "error", message: "Internal Server Error" });
    }
  };

  r.fail = (data: any, statusCode: number = 400) => {
    res.status(statusCode).json({ status: "fail", data });
  };

  r.unprocessable = (
    message: string,
    details: Record<string, unknown> = {},
  ) => {
    res.status(422).json({ status: "fail", message, ...details });
  };

  r.sendResponse = (statusCode: number, data: any) => {
    res.status(statusCode).json({ status: statusCode, data });
  };

  next();
};
