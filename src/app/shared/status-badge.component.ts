import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="toneClass">{{ label }}</span>
  `
})
export class StatusBadgeComponent {
  @Input({ required: true }) label = '';
  @Input() tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'critical' = 'neutral';

  get toneClass(): string {
    return `badge-${this.tone}`;
  }
}
