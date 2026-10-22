
import { Request, Response, NextFunction } from "express";
import { Permission } from "../auth/jwtAuth";

export function requirePermission(requiredPermission: Permission) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    if (!user.permissions.includes(requiredPermission)) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource"
      });
      return;
    }

    next();
  };
}
