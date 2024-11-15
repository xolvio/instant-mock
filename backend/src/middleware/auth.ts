import { verifySession } from "supertokens-node/recipe/session/framework/express";
import { middleware, errorHandler, SessionRequest } from "supertokens-node/framework/express";
import express from "express";

export const authMiddleware = {
    verify: verifySession(),
    init: middleware(),
    error: errorHandler(),
};

export interface AuthRequest extends SessionRequest {
    session: SessionRequest["session"];
}

export const requireAuth = (
    req: AuthRequest,
    res: express.Response,
    next: express.NextFunction
) => {
    if (!req.session) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
};
