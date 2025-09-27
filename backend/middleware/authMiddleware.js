import { getPrivyIdFromToken } from "../utils/verifyToke.js";

const authMiddleware = (req, res, next) => {
  try {
    const jwtToken = req.header("authorization")?.replace("Bearer ", "");
    if (!jwtToken) throw new Error("UNAUTHORIZED");

    const privyId = getPrivyIdFromToken(jwtToken); // Implement this function to decode the token
    req.privyId = privyId; // Attach privyId to the request object for use in routes

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "UNAUTHORIZED" });
  }
};

export default authMiddleware;
