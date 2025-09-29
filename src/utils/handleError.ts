import type { Request, Response } from "express";

export const handleError = (req: Request, res: Response, err: unknown) => {
  return res.status(500).json({
    success: false,
    message: "Something went wrong.",
    error: err,
  });
};
