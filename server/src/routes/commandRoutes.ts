import { NextFunction, Request, Response, Router } from "express";
import { writeCommandSchema } from "../commands/commandSchemas";
import { executeWriteCommand } from "../commands/commandService";

const router = Router();

/**
 * POST /api/commands
 * Submit a write command.
 */
router.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = writeCommandSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid command payload",
          errors: validation.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
      }

      const result = await executeWriteCommand(validation.data);

      return res.status(201).json({
        success: true,
        message: "Command accepted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/commands/health
 * Check whether the command API is available.
 */
router.get("/health", (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    service: "CQRS Write Command Service",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;