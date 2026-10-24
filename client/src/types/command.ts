export type CommandType =
  | 'CREATE_SHIPMENT'
  | 'UPDATE_SHIPMENT_STATUS';

export interface BaseCommand {
  commandId: string;
  shipmentId: string;
  expectedVersion: number;
}

export interface CreateShipmentCommand {
  type: 'CREATE_SHIPMENT';
  commandId: string;
  shipmentId: string;
}

export interface UpdateShipmentStatusCommand extends BaseCommand {
  type: 'UPDATE_SHIPMENT_STATUS';
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
}

export type Command =
  | CreateShipmentCommand
  | UpdateShipmentStatusCommand;