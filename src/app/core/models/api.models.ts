export type UserRole = 'OWNER' | 'GUEST';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DISABLED';
export type TenantStatus = 'ACTIVE' | 'INACTIVE';
export type PaymentStatus = 'PAID' | 'PENDING' | 'PARTIAL';
export type ConcernCategory = 'PLUMBING' | 'ELECTRICITY' | 'WIFI' | 'SECURITY' | 'HOUSEKEEPING';
export type ConcernStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type ConcernPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  role: UserRole;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GuestOverview {
  roomNumber: string;
  checkInDate: string;
  monthlyRentRate: number;
  rentReminderActive: boolean;
  reminderMessage: string | null;
}

export interface InvoiceLedgerItem {
  id: string;
  billingMonth: number;
  billingYear: number;
  totalAmountDue: number;
  amountPaid: number;
  pendingBalance: number;
  paymentStatus: PaymentStatus;
  dueDate: string;
  lastPaidDate: string | null;
}

export interface PaymentInitiateResponse {
  razorpayOrderId: string;
  razorpayKeyId: string;
  amountPaisa: number;
  currency: string;
}

export interface ConcernItem {
  id: string;
  category: ConcernCategory;
  description: string;
  status: ConcernStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RaiseConcernRequest {
  category: ConcernCategory;
  description: string;
}

export interface OwnerDashboardMetrics {
  occupancyRate: number;
  totalRooms: number;
  occupiedRooms: number;
  revenueCollectedThisMonth: number;
  totalPendingDues: number;
  openConcernsCount: number;
}

export interface ResidentSummary {
  tenantProfileId: string;
  name: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string | null;
  monthlyRentRate: number;
  status: TenantStatus;
}

export interface OwnerConcernItem {
  id: string;
  residentName: string;
  roomNumber: string;
  category: ConcernCategory;
  priority: ConcernPriority;
  status: ConcernStatus;
  createdAt: string;
}

export interface OwnerNotification {
  id: string;
  message: string;
  eventType: string;
  readFlag: boolean;
  createdAt: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: { email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void; confirm_close?: boolean };
  method?: {
    upi?: boolean;
    card?: boolean;
    netbanking?: boolean;
    wallet?: boolean;
    emi?: boolean;
  };
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayInstance {
  open(): void;
}
