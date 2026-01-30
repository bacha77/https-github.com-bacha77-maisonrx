
export enum OrderStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  EXCEPTION = 'EXCEPTION'
}

export type UserRole = 'SUPER_ADMIN' | 'PHARMACY_USER' | 'DRIVER';

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  passcode: string; // Added for secure login
  status: 'ACTIVE' | 'OFFLINE' | 'BUSY';
  currentLocation?: Location;
  assignedOrders?: string[];
  lastSeen?: string; // Tracking for HIPAA audit and fleet monitoring
}

export interface Pharmacy {
  id: string;
  name: string;
  licenseNumber: string;
  address: string;
  createdAt?: string;
}

export interface Order {
  id: string;
  patientName: string;
  patientPhone: string;
  address: string;
  medications: string[];
  status: OrderStatus;
  createdAt: string;
  driverId?: string;
  pharmacyId: string;
  deliveryWindow: string;
  signatureUrl?: string;
  isHighValue: boolean;
  requiresRefrigeration: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  details: string;
  ipAddress: string;
}

export interface CommunicationLog {
  id: string;
  driverId: string;
  timestamp: string;
  senderName: string;
  content: string;
  type: 'INBOUND' | 'OUTBOUND';
}
