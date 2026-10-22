import {
  Request,
  Response,
  NextFunction
} from "express";

import jwt, {
  JwtPayload as StandardJwtPayload,
  SignOptions
} from "jsonwebtoken";

import "dotenv/config";
import { randomUUID } from "crypto";

// ---------------------------------------------
// 1. Environment configuration
// ---------------------------------------------

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ISSUER =
  process.env.JWT_ISSUER || "m5-auth-engine";

const JWT_AUDIENCE =
  process.env.JWT_AUDIENCE || "m5-api";

const JWT_EXPIRES_IN =
  process.env.JWT_EXPIRES_IN || "15m";

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    "JWT_SECRET must contain at least 32 characters."
  );
}

// ---------------------------------------------
// 2. Types
// ---------------------------------------------

export type PersonaRole =
  | "LOGISTICS_DIRECTOR"
  | "DISPATCHER"
  | "CUSTOMS_OFFICER"
  | "IOT_DEVICE";

export type Permission =
  | "READ_SHIPMENTS"
  | "MANAGE_SHIPMENTS"
  | "DISPATCH"
  | "CUSTOMS"
  | "RECORD_TELEMETRY"
  | "VERIFY_AUDIT";

export interface JwtPayload {
  sub: string;
  name: string;
  role: PersonaRole;
  permissions: Permission[];
  jti: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string | string[];
}

// ---------------------------------------------
// 3. Persona definition
// ---------------------------------------------

export interface Persona {
  id: string;
  name: string;
  role: PersonaRole;
  permissions: Permission[];
}

const ALL_PERMISSIONS: Permission[] = [
  "READ_SHIPMENTS",
  "MANAGE_SHIPMENTS",
  "DISPATCH",
  "CUSTOMS",
  "RECORD_TELEMETRY",
  "VERIFY_AUDIT"
];

export const DEFAULT_PERSONAS: Persona[] = [
  {
    id: "operator-001",
    name: "Dr. Klaus Becker",
    role: "LOGISTICS_DIRECTOR",
    permissions: [...ALL_PERMISSIONS]
  },
  {
    id: "operator-002",
    name: "Markus Weber",
    role: "DISPATCHER",
    permissions: [
      "READ_SHIPMENTS",
      "DISPATCH",
      "RECORD_TELEMETRY"
    ]
  },
  {
    id: "operator-003",
    name: "Officer K. Lim",
    role: "CUSTOMS_OFFICER",
    permissions: [
      "READ_SHIPMENTS",
      "CUSTOMS",
      "RECORD_TELEMETRY",
      "VERIFY_AUDIT"
    ]
  },
  {
    id: "device-001",
    name: "Sensitech Tag #SN-8821",
    role: "IOT_DEVICE",
    permissions: [
      "RECORD_TELEMETRY"
    ]
  }
];

// ---------------------------------------------
// 4. JWT signing
// ---------------------------------------------

export function signJwt(
  persona: Persona
): string {
  const payload = {
    name: persona.name,
    role: persona.role,
    permissions: persona.permissions
  };

  const options: SignOptions = {
    algorithm: "HS256",
    subject: persona.id,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"],
    jwtid: randomUUID()
  };

  return jwt.sign(
    payload,
    JWT_SECRET!,
    options
  );
}

// ---------------------------------------------
// 5. JWT verification
// ---------------------------------------------

export function verifyJwt(
  token: string
): JwtPayload {
  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET!,
      {
        algorithms: ["HS256"],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE
      }
    );

    if (
      typeof decoded === "string" ||
      typeof decoded.sub !== "string" ||
      typeof decoded.name !== "string" ||
      typeof decoded.jti !== "string" ||
      typeof decoded.exp !== "number" ||
      !Array.isArray(decoded.permissions) ||
      !decoded.permissions.every(
        (permission: unknown) =>
          typeof permission === "string" &&
          ALL_PERMISSIONS.includes(
            permission as Permission
          )
      ) ||
      ![
        "LOGISTICS_DIRECTOR",
        "DISPATCHER",
        "CUSTOMS_OFFICER",
        "IOT_DEVICE"
      ].includes(decoded.role as string)
    ) {
      throw new Error("Invalid JWT claims");
    }

    return decoded as unknown as JwtPayload;

  } catch (error) {
    if (
      error instanceof jwt.TokenExpiredError
    ) {
      throw new Error("JWT token has expired");
    }

    if (
      error instanceof jwt.JsonWebTokenError
    ) {
      throw new Error(
        "Cryptographic signature verification failed"
      );
    }

    throw error;
  }
}

// ---------------------------------------------
// 6. Express request typing
// ---------------------------------------------

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ---------------------------------------------
// 7. Authentication middleware
// ---------------------------------------------

export function authenticateJwt(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authorization =
    req.headers.authorization;

  if (!authorization) {
    res.status(401).json({
      success: false,
      message: "Authorization header is required"
    });

    return;
  }

  const [scheme, token, ...extra] =
    authorization.trim().split(/\s+/);

  if (
    scheme?.toLowerCase() !== "bearer" ||
    !token ||
    extra.length > 0
  ) {
    res.status(401).json({
      success: false,
      message:
        "Authorization header must use Bearer token"
    });

    return;
  }

  try {
    req.user = verifyJwt(token);
    next();

  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Invalid authentication token";

    res.status(401).json({
      success: false,
      message
    });
  }
}
