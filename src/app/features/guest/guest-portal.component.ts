import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { RazorpayService } from '../../core/services/razorpay.service';
import {
  ConcernCategory,
  ConcernItem,
  GuestOverview,
  InvoiceLedgerItem
} from '../../core/models/api.models';
import { AppShellComponent } from '../../shared/app-shell.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-guest-portal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppShellComponent, StatusBadgeComponent],
  templateUrl: './guest-portal.component.html'
})
export class GuestPortalComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly razorpay = inject(RazorpayService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly overview = signal<GuestOverview | null>(null);
  readonly ledger = signal<InvoiceLedgerItem[]>([]);
  readonly concerns = signal<ConcernItem[]>([]);
  readonly paying = signal(false);
  readonly paymentMessage = signal<string | null>(null);
  readonly concernMessage = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  categories: ConcernCategory[] = ['PLUMBING', 'ELECTRICITY', 'WIFI', 'SECURITY', 'HOUSEKEEPING'];

  concernForm = this.fb.nonNullable.group({
    category: ['PLUMBING' as ConcernCategory, Validators.required],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]]
  });

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.error.set(null);
    this.api.getGuestOverview().subscribe({
      next: (overview) => this.overview.set(overview),
      error: () => this.error.set('Unable to load your account overview.')
    });
    this.api.getPaymentLedger().subscribe((ledger) => this.ledger.set(ledger));
    this.api.getGuestConcerns().subscribe((concerns) => this.concerns.set(concerns));
  }

  monthName(month: number): string {
    return new Date(2000, month - 1, 1).toLocaleString('en-IN', { month: 'long' });
  }

  money(value: number): string {
    return `₹${Math.round(value).toLocaleString('en-IN')}`;
  }

  paymentTone(status: string): 'success' | 'warning' | 'info' {
    if (status === 'PAID') return 'success';
    if (status === 'PARTIAL') return 'info';
    return 'warning';
  }

  concernTone(status: string): 'success' | 'warning' | 'info' {
    if (status === 'RESOLVED') return 'success';
    if (status === 'IN_PROGRESS') return 'info';
    return 'warning';
  }

  payNow(invoice: InvoiceLedgerItem): void {
    this.paying.set(true);
    this.paymentMessage.set(null);
    this.error.set(null);
    const description = `Rent for ${this.monthName(invoice.billingMonth)} ${invoice.billingYear}`;
    this.razorpay.payInvoice(invoice.id, description, this.auth.email() ?? '').subscribe({
      next: () => {
        this.paying.set(false);
        this.paymentMessage.set('Payment submitted. Status updates after Razorpay confirms the webhook.');
        setTimeout(() => this.refresh(), 2000);
      },
      error: (err: Error) => {
        this.paying.set(false);
        this.error.set(err.message || 'Payment could not be started. Check Razorpay configuration.');
      }
    });
  }

  submitConcern(): void {
    if (this.concernForm.invalid) {
      this.concernForm.markAllAsTouched();
      return;
    }
    this.concernMessage.set(null);
    this.api.raiseConcern(this.concernForm.getRawValue()).subscribe({
      next: () => {
        this.concernForm.reset({ category: 'PLUMBING', description: '' });
        this.concernMessage.set('Concern submitted. The owner desk has been notified.');
        this.api.getGuestConcerns().subscribe((items) => this.concerns.set(items));
      },
      error: () => this.error.set('Could not submit the concern. Please try again.')
    });
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
