import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

import createHttpError from "http-errors";
import type { IJwtPayload, IRefreshTokenPayload } from "../interfaces/jwt.interface.js";

const JWT_SECRET = env.JWT_SECRET;
const JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET;

export const generateAccessToken = (payload: {
  id: string;
}) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" }); // for testing 15m later will be 1h
};
export const generateSocketTicket = (payload: {
  id: string;
}) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "60s" });
};

export const generateRefreshToken = (payload: { id: string }) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
    jwtid: crypto.randomUUID(),
  });
};

export const verifyAccessToken = (token: string): IJwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded !== "object" || !("id" in decoded)) {
      throw createHttpError.Unauthorized("Invalid token payload");
    }

    return decoded as IJwtPayload;
  } catch (error) {
    throw createHttpError.Unauthorized("Invalid or expired access token");
  }
};

export const verifyRefreshToken = (token: string): IRefreshTokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);

    if (typeof decoded !== "object" || !("id" in decoded)) {
      throw createHttpError.Unauthorized("Invalid refresh token payload");
    }

    return decoded as IRefreshTokenPayload;
  } catch (error) {
    throw createHttpError.Unauthorized("Invalid or expired refresh token");
  }
};

export const daysToMs = (days: number) => days * 24 * 60 * 60 * 1000;
