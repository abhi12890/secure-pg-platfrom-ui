import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="metric-card">
      <p class="metric-label">{{ label }}</p>
      <p class="metric-value" [ngClass]="valueClass">{{ value }}</p>
      @if (hint) {
        <p class="metric-hint">{{ hint }}</p>
      }
    </article>
  `
})
export class MetricCardComponent {
  @Input({ required: true }) label = '';
  @Input({ required: true }) value = '';
  @Input() hint = '';
  @Input() valueClass = 'text-primary';
}
