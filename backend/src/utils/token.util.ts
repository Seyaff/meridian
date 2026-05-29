import jwt, { SignOptions } from "jsonwebtoken"

import { Env } from "../config/app.config"
import { UserRole } from "../models/user.model"

export interface AccessTokenPayload {
    sub : string,
    role : UserRole,
    type : "access"
}


export interface RefreshTokenPaylod {
    sub : string
    familyId : string
    type : "refresh"
}

const accessSignOptions: SignOptions = {
  expiresIn: Env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
};

const refreshSignOptions: SignOptions = {
  expiresIn: Env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
};



export const signAccessToken = (userId : string , role : UserRole) => {
    const payload : AccessTokenPayload = {sub : userId , role , type : "access"}
    return jwt.sign(payload , Env.JWT_ACCESS_SECRET , accessSignOptions)
}


export const signRefreshToken = (userId : string , familyId : string) => {
    const payload : RefreshTokenPaylod = {sub : userId , familyId , type : "refresh"}
    return jwt.sign(payload , Env.JWT_REFRESH_SECRET , refreshSignOptions)
}


export const verifyRefreshToken = (rawToken : string) => {
    const payload = jwt.verify(rawToken , Env.JWT_REFRESH_SECRET) as RefreshTokenPaylod
    if(payload.type !== "refresh") {
        throw new Error("Invalid token type")
    }
    return payload
}


export const verifyAccessToken = (rawToken: string) => {
    const payload  = jwt.verify(rawToken , Env.JWT_ACCESS_SECRET) as AccessTokenPayload
    if(payload.type !== "access") {
        throw new Error("Invalid Token type")
    }

    return payload
}