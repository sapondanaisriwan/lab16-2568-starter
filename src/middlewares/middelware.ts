import type { NextFunction, Request, Response } from "express";
import { handleRes } from "../utils/handleRes.js";

import jwt from "jsonwebtoken";
import { users } from "../db/db.js";
import type { CustomRequest, UserPayload } from "../libs/types.js";
import { handleError } from "../utils/handleError.js";

export const authCheck = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. check Request if "authorization" header exists
    //    and container "Bearer ...JWT-Token..."
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return handleRes(
        req,
        res,
        401,
        false,
        "Authorization header is not found"
      );
    }

    // 2. extract the "...JWT-Token..." if available
    const token = authHeader.split(" ")[1];

    if (!token) {
      return handleRes(req, res, 401, false, "Token is required");
    }

    // 3. verify token using JWT_SECRET_KEY and get payload (username, studentId and role)
    const jwtKey = process.env.JWT_SECRET || "JustSayLove";
    jwt.verify(token, jwtKey, (err, decoded) => {
      if (err) {
        return handleRes(req, res, 403, false, "Invalid or expired token");
      }

      // Check if user is in db?
      const payload = decoded as UserPayload;
      const user = users.find((user) => user.username === payload.username);
      if (!user) {
        return handleRes(req, res, 401, false, "User not found");
      }

      req.user = payload;
      req.token = token;
    });
    next();
  } catch (err) {
    return handleError(req, res, err);
  }
};

export const adminCheck = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return handleRes(req, res, 401, false, "⛔ User not authenticated");
    }

    const { role } = req.user;

    if (!role) {
      return handleRes(req, res, 401, false, "⛔ Role not found");
    }

    // student
    if (role !== "ADMIN") {
      return handleRes(req, res, 401, false, "⛔ Unauthorized user");
    }
    next();
  } catch (err) {
    return handleError(req, res, err);
  }
};
