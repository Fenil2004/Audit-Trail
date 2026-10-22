import { Router, Request, Response } from 'express';
import { validateIncomingCommand } from './commandService';

const commandRouter = Router();

/**
 * POST / 
 * Validates an incoming command payload.
 */
commandRouter.post('/', (req: Request, res: Response) => {
  const result = validateIncomingCommand(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid command payload',
      errors: result.errors,
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Command payload validated successfully',
    command: result.data,
  });
});

export default commandRouter;
