import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-shell">
      <header class="app-header">
        <div class="brand-block">
          <div class="brand-mark" aria-hidden="true">PG</div>
          <div>
            <p class="brand-kicker">Secure PG Platform</p>
            <h1>{{ title }}</h1>
            @if (subtitle) {
              <p class="brand-subtitle">{{ subtitle }}</p>
            }
          </div>
        </div>
        <div class="header-actions">
          <span class="user-chip">{{ email }}</span>
          <button type="button" class="ghost-btn" (click)="logout.emit()">Logout</button>
        </div>
      </header>
      <main class="app-main">
        <ng-content />
      </main>
    </div>
  `
})
export class AppShellComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle = '';
  @Input() email = '';
  @Output() logout = new EventEmitter<void>();
}
