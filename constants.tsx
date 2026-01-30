
import React from 'react';
import { Driver, CommunicationLog, Pharmacy, OrderStatus } from './types';

export const APP_NAME = "MaisonRX";
export const HIPAA_DISCLAIMER = "PHI Data Protected by 256-bit AES Encryption. Access Logged.";

export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ASSIGNED: 'bg-blue-100 text-blue-800 border-blue-200',
  PICKED_UP: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800 border-purple-200',
  DELIVERED: 'bg-green-100 text-green-800 border-green-200',
  EXCEPTION: 'bg-red-100 text-red-700 border-red-200',
  CANCELLED: 'bg-slate-100 text-slate-800 border-slate-200',
};

export const MOCK_PHARMACIES: (Pharmacy & { passcode: string })[] = [
  {
    id: 'PH-771',
    name: 'Northside Community Pharmacy',
    licenseNumber: 'RPH-992831',
    address: '882 West Oak, Springfield, IL',
    passcode: 'admin123'
  },
  {
    id: 'PH-442',
    name: 'Springfield Wellness Center',
    licenseNumber: 'RPH-110229',
    address: '12 Medical Plaza, Springfield, IL',
    passcode: 'wellness442'
  }
];

export const MOCK_DRIVERS: Driver[] = [
  {
    id: 'D-101',
    name: 'Kevin Brooks',
    phone: '(555) 234-5678',
    passcode: 'driver101',
    status: 'ACTIVE',
    currentLocation: { lat: 39.7817, lng: -89.6501, address: 'Near Springfield General' },
    lastSeen: new Date().toISOString()
  },
  {
    id: 'D-102',
    name: 'Sarah Miller',
    phone: '(555) 345-6789',
    passcode: 'driver102',
    status: 'BUSY',
    currentLocation: { lat: 39.7999, lng: -89.6433, address: '456 Westside Industrial' },
    lastSeen: new Date().toISOString()
  }
];

export const MOCK_ORDERS = [
  {
    id: 'ORD-12093',
    patientName: 'John Doe',
    patientPhone: '(555) 123-4567',
    address: '123 Maple St, Springfield, IL',
    medications: ['Lisinopril 10mg'],
    status: OrderStatus.OUT_FOR_DELIVERY,
    createdAt: new Date().toISOString(),
    deliveryWindow: '2:00 PM - 4:00 PM',
    isHighValue: true,
    requiresRefrigeration: false,
    pharmacyId: 'PH-771'
  }
];

export const MOCK_COMMUNICATIONS: CommunicationLog[] = [
  {
    id: 'c-1',
    driverId: 'D-101',
    timestamp: new Date().toISOString(),
    senderName: 'Kevin Brooks',
    content: 'Order ORD-12093 is ready for pickup.',
    type: 'INBOUND'
  }
];
