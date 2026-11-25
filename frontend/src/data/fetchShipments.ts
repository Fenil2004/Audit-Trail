const API_BASE_URL = "http://127.0.0.1:5000";

export type ShipmentStatus =
  | "CREATED"
  | "IN_TRANSIT"
  | "DELIVERED";

export interface Shipment {
  shipmentId: string;
  title: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  expectedDelivery: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface ShipmentListResponse {
  success: boolean;
  count: number;
  shipments: Shipment[];
}

interface SingleShipmentResponse {
  success: boolean;
  shipment: Shipment;
}

interface CreateShipmentInput {
  title: string;
  origin: string;
  destination: string;
  expectedDelivery: string;
}

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  const data = await response.json() as ApiResponse<T> & Record<string, unknown>;

  if (!response.ok || !data.success) {
    throw new Error(
      typeof data.message === "string"
        ? data.message
        : `Request failed: ${response.status}`,
    );
  }

  return data as T;
}

export async function fetchShipments(): Promise<Shipment[]> {
  const data = await apiRequest<ShipmentListResponse>(
    "/api/shipments",
  );

  if (!Array.isArray(data.shipments)) {
    throw new Error("Invalid shipments response");
  }

  return data.shipments;
}

export async function fetchShipment(
  shipmentId: string,
): Promise<Shipment> {
  const data = await apiRequest<SingleShipmentResponse>(
    `/api/shipments/${encodeURIComponent(shipmentId)}`,
  );

  return data.shipment;
}

export async function createShipment(
  input: CreateShipmentInput,
): Promise<Shipment> {
  const data = await apiRequest<SingleShipmentResponse>(
    "/api/shipments",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return data.shipment;
}

export async function updateShipmentStatus(
  shipmentId: string,
  status: ShipmentStatus,
): Promise<Shipment> {
  const data = await apiRequest<SingleShipmentResponse>(
    `/api/shipments/${encodeURIComponent(shipmentId)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );

  return data.shipment;
}