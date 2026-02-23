import { FastifyRequest, FastifyReply } from "fastify";
import { env } from "../../../infrastructure/config/env.js";


const isProduction = env.NODE_ENV === "production";

const COOKIE_BASE = {
  httpOnly: true,           
  secure: isProduction,      
  sameSite: "lax" as const,
  path: "/",                 
};


export function getCookie(request: FastifyRequest, name: string): string | undefined {
  return request.cookies[name];
}

export function setAccessTokenCookie(reply: FastifyReply, token: string) {
  reply.setCookie("accessToken", token, {
    ...COOKIE_BASE,
    maxAge: 900,  
  });
}


export function setRefreshTokenCookie(reply: FastifyReply, token: string) {
  reply.setCookie("refreshToken", token, {
    ...COOKIE_BASE,
    maxAge: 604800,  
  });
}


export function clearCookie(reply: FastifyReply, name: string) {
  reply.clearCookie(name, {
    ...COOKIE_BASE,
  });
}
