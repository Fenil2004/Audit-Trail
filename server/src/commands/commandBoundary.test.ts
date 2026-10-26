import { validateCommandBoundary } from './commandBoundary';

describe('Command boundary invariants', () => {
  it('accepts valid boundary fields', () => {
    const result = validateCommandBoundary({
      commandId: 'cmd-001',
      shipmentId: 'ship-001',
      expectedVersion: 0,
    });

    expect(result.success).toBe(true);
  });

  it('rejects a negative version', () => {
    const result = validateCommandBoundary({
      commandId: 'cmd-001',
      shipmentId: 'ship-001',
      expectedVersion: -1,
    });

    expect(result.success).toBe(false);
  });

  it('rejects unexpected fields', () => {
    const result = validateCommandBoundary({
      commandId: 'cmd-001',
      shipmentId: 'ship-001',
      extra: true,
    });

    expect(result.success).toBe(false);
  });
});
