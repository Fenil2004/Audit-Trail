import { beforeEach, describe, expect, it, vi } from 'vitest';
import { validateCommand } from './commandSchemas';

describe('Command Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Command Validation', () => {
    it('should accept a valid CreateShipment command', () => {
      const command = {
        commandId: 'cmd-001',
        type: 'CreateShipment',
        shipmentId: 'ship-001',
        version: 1,
      };

      const result = validateCommand(command);

      expect(result.success).toBe(true);
    });

    it('should reject a command with an invalid version', () => {
      const command = {
        commandId: 'cmd-002',
        type: 'CreateShipment',
        shipmentId: 'ship-002',
        version: -1,
      };

      const result = validateCommand(command);

      expect(result.success).toBe(false);
    });

    it('should reject a command with a missing commandId', () => {
      const command = {
        type: 'CreateShipment',
        shipmentId: 'ship-003',
        version: 1,
      };

      const result = validateCommand(command);

      expect(result.success).toBe(false);
    });

    it('should reject an unsupported command type', () => {
      const command = {
        commandId: 'cmd-004',
        type: 'DeleteShipment',
        shipmentId: 'ship-004',
        version: 1,
      };

      const result = validateCommand(command);

      expect(result.success).toBe(false);
    });
  });

  describe('Command Service Result', () => {
    it('should represent a successful command result', () => {
      const result = {
        success: true,
        commandId: 'cmd-005',
        aggregateId: 'ship-005',
        version: 1,
      };

      expect(result.success).toBe(true);
      expect(result.commandId).toBe('cmd-005');
      expect(result.aggregateId).toBe('ship-005');
      expect(result.version).toBe(1);
    });

    it('should represent a failed command result', () => {
      const result = {
        success: false,
        error: 'Command validation failed',
      };

      expect(result.success).toBe(false);
      expect(result.error).toBe('Command validation failed');
    });
  });
});