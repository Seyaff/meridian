import { Request, Response } from "express";
import { Env } from "../config/app.config";

const REFRESH_COOKIE = "refreshToken";
const ACCESS_COOKIE = "accessToken";

const COOKIE_PATH = "/";

const cookieOptions = {
  httpOnly: true,
  secure: true, // required when SameSite=None
  sameSite: "none" as const,
  path: COOKIE_PATH,
};

const accessCookieOptions = {
  httpOnly: true,
  secure : Env.NODE_ENV === "production",
  sameSite : Env.NODE_ENV === "production" ? ("strict" as const) : ("lax" as const)
}


export function setRefreshCookie(
  res: Response,
  refreshToken: string,
): void {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export function setAccessCookie(
  res: Response,
  accessToken: string,
): void {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
}




export function getAccessTokenFromCookies(req: Request) {
  return req.cookies[ACCESS_COOKIE];
}

export function getRefreshTokenFromCookies(req: Request) {
  return req.cookies[REFRESH_COOKIE];
}

export function clearRefreshCookie(res: Response) {
  return res.clearCookie(REFRESH_COOKIE, cookieOptions);
}

export function clearAccessCookie(res: Response) {
  return res.clearCookie(ACCESS_COOKIE, cookieOptions);
}

export function clearCookiePair(res: Response) {
  res.clearCookie(ACCESS_COOKIE, cookieOptions);
  res.clearCookie(REFRESH_COOKIE, cookieOptions);
}