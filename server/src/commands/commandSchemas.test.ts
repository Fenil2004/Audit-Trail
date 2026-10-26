import { describe, expect, it } from 'vitest';
import {
    CommandSchema,
    validateCommand,
} from './commandSchemas';

describe('Command boundary validation', () => {
  it('accepts a valid create shipment command', () => {
    const result = validateCommand({
      type: 'CREATE_SHIPMENT',
      commandId: 'cmd-001',
      shipmentId: 'ship-001',
    });

    expect(result.success).toBe(true);
  });

  it('rejects an empty command ID', () => {
    const result = CommandSchema.safeParse({
      type: 'CREATE_SHIPMENT',
      commandId: '',
      shipmentId: 'ship-001',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a negative version', () => {
    const result = CommandSchema.safeParse({
      type: 'UPDATE_SHIPMENT_STATUS',
      commandId: 'cmd-002',
      shipmentId: 'ship-001',
      expectedVersion: -1,
      status: 'in_transit',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an unsupported shipment status', () => {
    const result = CommandSchema.safeParse({
      type: 'UPDATE_SHIPMENT_STATUS',
      commandId: 'cmd-003',
      shipmentId: 'ship-001',
      expectedVersion: 0,
      status: 'lost',
    });

    expect(result.success).toBe(false);
  });

  it('rejects unexpected fields', () => {
    const result = CommandSchema.safeParse({
      type: 'CREATE_SHIPMENT',
      commandId: 'cmd-004',
      shipmentId: 'ship-001',
      unexpectedField: true,
    });

    expect(result.success).toBe(false);
  });
});