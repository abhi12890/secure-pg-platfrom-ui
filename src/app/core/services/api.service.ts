import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  ConcernItem,
  GuestOverview,
  InvoiceLedgerItem,
  LoginRequest,
  OwnerConcernItem,
  OwnerDashboardMetrics,
  OwnerNotification,
  PaymentInitiateResponse,
  RaiseConcernRequest,
  ResidentSummary
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  login(body: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/login`, body);
  }

  getOwnerMetrics(): Observable<OwnerDashboardMetrics> {
    return this.http.get<OwnerDashboardMetrics>(`${this.base}/owner/dashboard/metrics`);
  }

  getActiveResidents(): Observable<ResidentSummary[]> {
    return this.http.get<ResidentSummary[]>(`${this.base}/owner/residents/active`);
  }

  getInactiveResidents(): Observable<ResidentSummary[]> {
    return this.http.get<ResidentSummary[]>(`${this.base}/owner/residents/inactive`);
  }

  deactivateResident(tenantProfileId: string): Observable<ResidentSummary> {
    return this.http.post<ResidentSummary>(
      `${this.base}/owner/residents/${tenantProfileId}/deactivate`,
      {}
    );
  }

  getOwnerConcerns(): Observable<OwnerConcernItem[]> {
    return this.http.get<OwnerConcernItem[]>(`${this.base}/owner/concerns`);
  }

  updateConcernStatus(concernId: string, status: string): Observable<OwnerConcernItem> {
    return this.http.patch<OwnerConcernItem>(`${this.base}/owner/concerns/${concernId}/status`, {
      status
    });
  }

  getOwnerNotifications(): Observable<OwnerNotification[]> {
    return this.http.get<OwnerNotification[]>(`${this.base}/owner/notifications`);
  }

  getGuestOverview(): Observable<GuestOverview> {
    return this.http.get<GuestOverview>(`${this.base}/guest/overview`);
  }

  getPaymentLedger(): Observable<InvoiceLedgerItem[]> {
    return this.http.get<InvoiceLedgerItem[]>(`${this.base}/guest/payments/ledger`);
  }

  initiatePayment(invoiceId: string): Observable<PaymentInitiateResponse> {
    return this.http.post<PaymentInitiateResponse>(
      `${this.base}/guest/payments/initiate/${invoiceId}`,
      {}
    );
  }

  raiseConcern(body: RaiseConcernRequest): Observable<ConcernItem> {
    return this.http.post<ConcernItem>(`${this.base}/guest/concerns/raise`, body);
  }

  getGuestConcerns(): Observable<ConcernItem[]> {
    return this.http.get<ConcernItem[]>(`${this.base}/guest/concerns`);
  }
}
