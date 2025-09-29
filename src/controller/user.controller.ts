import type { Request, Response } from "express";
import { handleError } from "../utils/handleError.js";
import { zLoginBody } from "../libs/zodValidators.js";
import { users } from "../db/db.js";
import { handleRes } from "../utils/handleRes.js";

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const userLogin = (req: Request, res: Response) => {
  try {
    const body = req.body;
    const isValid = zLoginBody.safeParse(body);

    if (!isValid.success) {
      return res.json({ message: "Here r rai wa" });
    }

    const { username, password } = body;

    // Step 1 find user
    const user = users.find(
      (user) => user.username === username && user.password === password
    );

    // Step 2 Check if user was found
    if (!user) {
      return handleRes(req, res, 401, false, "Invalid username or password");
    }

    // Step 3 Create a token
    const jwtKey = process.env.JWT_SECRET || "JustSayLove";
    const payload = {
      username: user.username,
      studentId: user.studentId,
      role: user.role,
    };

    const token = jwt.sign(payload, jwtKey, { expiresIn: "1d" });

    return handleRes(req, res, 200, true, "Login successfully 😎", token);
  } catch (err) {
    return handleError(req, res, err);
  }
};

export const userLogout = (req: Request, res: Response) => {
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
      console.log(decoded);
    });

    // 4. check if user exists (search with username)

    // 5. proceed with logout process and return HTTP response
    //    (optional: remove the token from User data)

    return res.status(500).json({
      success: false,
      message: "POST /api/v2/users/logout has not been implemented yet",
    });
  } catch (err) {
    return handleError(req, res, err);
  }
};
