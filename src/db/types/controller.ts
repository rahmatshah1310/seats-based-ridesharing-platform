import type { RequestHandler } from "express";

export type Controller<TParams = any, TResBody = any, TReqBody = any> = RequestHandler<TParams, TResBody, TReqBody>;
