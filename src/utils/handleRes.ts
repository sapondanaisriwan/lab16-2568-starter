import type { Response, Request } from "express";

export const handleRes = (
  req: Request,
  res: Response,
  status: number,
  success: boolean,
  msg: string,
  data?: any
) => {
  return res.status(status).json({
    success: success,
    message: msg,
    data,
  });
};
