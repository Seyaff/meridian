import { Request, Response } from "express";
import { Env } from "../config/app.config";

const REFRESH_COOKIE = "refreshToken";
const ACCESS_COOKIE = "accessToken"
// Path "/" so the browser sends the cookie on frontend navigations (middleware can read it).
const COOKIE_PATH = "/";

const cookieOptions = {
  httpOnly: true,
  secure: Env.NODE_ENV === "production",
  sameSite: Env.NODE_ENV === "production" ? ("strict" as const) : ("lax" as const),
  path: COOKIE_PATH,
};


const accessCookieOptions = {
  httpOnly: true,
  secure : Env.NODE_ENV === "production",
  sameSite : Env.NODE_ENV === "production" ? ("strict" as const) : ("lax" as const)
}


export function setRefreshCookie(res: Response, refreshToken: string): void {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}


export function setAccessCookie(res: Response  , accessToken : string) : void {
  res.cookie(ACCESS_COOKIE , accessToken , {
    ...accessCookieOptions,
    maxAge : 15*60*1000
  })
}




export function getAccessTokenFromCookies  (req:Request)  {
  return req.cookies.accessToken
}

export function getRefreshTokenFromCookies (req :Request) {
  return req.cookies.refreshToken
}


export function clearRefreshCookie(res: Response) {
  return res.clearCookie("refreshToken")
}


export function cleareCookiePair  (res:Response) {
  res.clearCookie("accessToken"),
  res.clearCookie("refreshToken")

  return
}