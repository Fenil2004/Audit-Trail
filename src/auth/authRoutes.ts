import {
  Router,
  Request,
  Response
} from "express";

import {
  DEFAULT_PERSONAS,
  signJwt,
  verifyJwt
} from "./jwtAuth";

export const authRouter = Router();

// ---------------------------------------------
// GET /api/auth/personas
// ---------------------------------------------

authRouter.get(
  "/personas",
  (_req: Request, res: Response) => {
    const personas = DEFAULT_PERSONAS.map(
      (persona) => ({
        id: persona.id,
        name: persona.name,
        role: persona.role,
        permissions: persona.permissions,
        token: signJwt(persona)
      })
    );

    res.status(200).json({
      success: true,
      count: personas.length,
      personas
    });
  }
);

// ---------------------------------------------
// POST /api/auth/verify
// ---------------------------------------------

authRouter.post(
  "/verify",
  (req: Request, res: Response) => {
    const { token } = req.body as {
      token?: unknown;
    };

    if (
      typeof token !== "string" ||
      token.trim().length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "A JWT token is required"
      });

      return;
    }

    try {
      const payload = verifyJwt(token);

      res.status(200).json({
        success: true,
        message: "Token verified successfully",
        user: {
          id: payload.sub,
          name: payload.name,
          role: payload.role,
          permissions: payload.permissions
        },
        tokenInfo: {
          issuer: payload.iss,
          audience: payload.aud,
          issuedAt: payload.iat,
          expiresAt: payload.exp,
          tokenId: payload.jti
        }
      });

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Token verification failed";

      res.status(401).json({
        success: false,
        message
      });
    }
  }
);
