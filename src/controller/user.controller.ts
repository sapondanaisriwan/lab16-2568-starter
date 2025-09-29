import type { Request, Response } from "express";
import { handleError } from "../utils/handleError.js";
import { zLoginBody } from "../libs/zodValidators.js";
import { users } from "../db/db.js";
import { handleRes } from "../utils/handleRes.js";

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import type { CustomRequest } from "../libs/types.js";
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

export const userLogout = (req: CustomRequest, res: Response) => {
  try {
    const user = req.user;
    const token = req.token;

    if (!user || !token) {
      return handleRes(req, res, 401, false, "Invalid token or user");
    }

    // if token exists, remove the token from user.tokens
    delete req.user;
    delete req.token;

    return handleRes(req, res, 200, true, "Logout successfully 🥳");
  } catch (err) {
    return handleError(req, res, err);
  }
};
