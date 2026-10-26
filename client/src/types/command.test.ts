import { describe, it, expect } from 'vitest';
import type {
  Command,
  CreateShipmentCommand,
  UpdateShipmentStatusCommand,
} from './command';

describe('Command Type Contracts', () => {
  it('should define a valid CREATE_SHIPMENT command', () => {
    const command: CreateShipmentCommand = {
      type: 'CREATE_SHIPMENT',
      commandId: 'cmd-001',
      shipmentId: 'ship-001',
    };

    expect(command.type).toBe('CREATE_SHIPMENT');
    expect(command.commandId).toBe('cmd-001');
    expect(command.shipmentId).toBe('ship-001');
  });

  it('should define a valid UPDATE_SHIPMENT_STATUS command', () => {
    const command: UpdateShipmentStatusCommand = {
      type: 'UPDATE_SHIPMENT_STATUS',
      commandId: 'cmd-002',
      shipmentId: 'ship-002',
      expectedVersion: 1,
      status: 'in_transit',
    };

    expect(command.type).toBe('UPDATE_SHIPMENT_STATUS');
    expect(command.expectedVersion).toBe(1);
    expect(command.status).toBe('in_transit');
  });

  it('should support both command types through the Command union', () => {
    const commands: Command[] = [
      {
        type: 'CREATE_SHIPMENT',
        commandId: 'cmd-003',
        shipmentId: 'ship-003',
      },
      {
        type: 'UPDATE_SHIPMENT_STATUS',
        commandId: 'cmd-004',
        shipmentId: 'ship-004',
        expectedVersion: 2,
        status: 'delivered',
      },
    ];

    expect(commands).toHaveLength(2);
  });
});
```