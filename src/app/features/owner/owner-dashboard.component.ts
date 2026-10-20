import { Component, NgZone, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';
import {
  OwnerConcernItem,
  OwnerDashboardMetrics,
  OwnerNotification,
  ResidentSummary
} from '../../core/models/api.models';
import { AppShellComponent } from '../../shared/app-shell.component';
import { MetricCardComponent } from '../../shared/metric-card.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, AppShellComponent, MetricCardComponent, StatusBadgeComponent],
  templateUrl: './owner-dashboard.component.html'
})
export class OwnerDashboardComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);

  readonly metrics = signal<OwnerDashboardMetrics | null>(null);
  readonly activeResidents = signal<ResidentSummary[]>([]);
  readonly inactiveResidents = signal<ResidentSummary[]>([]);
  readonly concerns = signal<OwnerConcernItem[]>([]);
  readonly notifications = signal<OwnerNotification[]>([]);
  readonly residentTab = signal<'active' | 'inactive'>('active');
  readonly loading = signal(true);
  readonly actionError = signal<string | null>(null);

  private notificationAbortController: AbortController | null = null;

  ngOnInit(): void {
    this.refreshAll();
    void this.startNotificationStream();
  }

  ngOnDestroy(): void {
    this.notificationAbortController?.abort();
  }

  occupancyLabel(): string {
    const metrics = this.metrics();
    return metrics ? `${metrics.occupancyRate.toFixed(1)}%` : '—';
  }

  money(value: number | undefined): string {
    return `₹${Math.round(value ?? 0).toLocaleString('en-IN')}`;
  }

  priorityTone(priority: string): 'critical' | 'danger' | 'warning' | 'info' {
    if (priority === 'CRITICAL') return 'critical';
    if (priority === 'HIGH') return 'danger';
    if (priority === 'MEDIUM') return 'warning';
    return 'info';
  }

  statusTone(status: string): 'success' | 'warning' | 'info' | 'neutral' {
    if (status === 'RESOLVED') return 'success';
    if (status === 'IN_PROGRESS') return 'info';
    if (status === 'OPEN') return 'warning';
    return 'neutral';
  }

  private async startNotificationStream(): Promise<void> {
    const token = this.auth.getToken();
    if (!token) {
      return;
    }

    this.notificationAbortController = new AbortController();
    const controller = this.notificationAbortController;
    try {
      const response = await fetch(`${environment.apiBaseUrl}/owner/notifications/stream`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal
      });
      if (!response.ok || !response.body) {
        throw new Error('Notification stream unavailable');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';
        for (const event of events) {
          if (!event.includes('event:notification')) {
            continue;
          }
          const data = event.split('\n').find((line) => line.startsWith('data:'));
          if (!data) {
            continue;
          }
          const notification = JSON.parse(data.slice(5)) as OwnerNotification;
          this.zone.run(() => {
            this.notifications.update((current) =>
              [notification, ...current.filter((item) => item.id !== notification.id)].slice(0, 50)
            );
            // Keep the owner desk metrics and complaint/resident lists in sync with the live feed.
            this.api.getOwnerMetrics().subscribe({ next: (metrics) => this.metrics.set(metrics) });
            if (notification.eventType === 'CONCERN_RAISED') {
              this.api.getOwnerConcerns().subscribe({ next: (items) => this.concerns.set(items) });
            }
          });
        }
      }
    } catch {
      if (!controller.signal.aborted) {
        this.zone.run(() => this.refreshNotifications());
      }
    }
  }

  refreshAll(): void {
    this.loading.set(true);
    this.actionError.set(null);
    this.api.getOwnerMetrics().subscribe({
      next: (metrics) => this.metrics.set(metrics),
      error: () => this.actionError.set('Unable to load dashboard metrics.')
    });
    this.api.getActiveResidents().subscribe((residents) => this.activeResidents.set(residents));
    this.api.getInactiveResidents().subscribe((residents) => this.inactiveResidents.set(residents));
    this.api.getOwnerConcerns().subscribe((concerns) => {
      this.concerns.set(concerns);
      this.loading.set(false);
    });
    this.refreshNotifications();
  }

  refreshNotifications(): void {
    this.api.getOwnerNotifications().subscribe((notifications) => this.notifications.set(notifications));
  }

  deactivate(resident: ResidentSummary): void {
    const confirmed = window.confirm(`Mark ${resident.name} as vacated and release room ${resident.roomNumber}?`);
    if (!confirmed) {
      return;
    }
    this.api.deactivateResident(resident.tenantProfileId).subscribe({
      next: () => this.refreshAll(),
      error: () => this.actionError.set('Could not update resident status.')
    });
  }

  setConcernStatus(concern: OwnerConcernItem, status: string): void {
    this.api.updateConcernStatus(concern.id, status).subscribe({
      next: () => this.api.getOwnerConcerns().subscribe((items) => this.concerns.set(items)),
      error: () => this.actionError.set('Could not update concern status.')
    });
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
