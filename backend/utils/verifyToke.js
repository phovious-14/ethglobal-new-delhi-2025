import * as jose from "jose";

export const getPrivyIdFromToken = (jwtToken) => {
  const privyId = jose.decodeJwt(jwtToken).sub;
  if (!privyId) {
    console.error("getPrivyIdFromToken: privyId not found");
    throw new Error("UNAUTHORIZED");
  }
  return privyId;
};
