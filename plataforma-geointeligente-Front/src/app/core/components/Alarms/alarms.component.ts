import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-alarms',
  standalone: true,
  imports: [CommonModule, ToastModule, ButtonModule],
  template: `
    <!-- Multiple toast placeholders so callers can target positions by key -->
    <p-toast key="tl" position="top-left"></p-toast>
    <p-toast key="bl" position="bottom-left"></p-toast>
    <p-toast key="br" position="bottom-right"></p-toast>
    <p-toast key="global" position="top-right"></p-toast>
  `,
  styles: [
    `:host ::ng-deep .p-toast { z-index: 6000 }

    /* Base toast appearance to ensure visible background, shadow and padding */
    :host ::ng-deep .p-toast .p-toast-message {
      background: #ffffff;
      color: #0f172a;
      padding: 12px 14px;
      border-radius: 8px;
      box-shadow: 0 8px 20px rgba(2,6,23,0.12);
      border: 1px solid rgba(2,6,23,0.06);
      min-width: 320px;
      max-width: 760px;
      overflow-wrap: anywhere;
    }

    :host ::ng-deep .p-toast .p-toast-message .p-toast-summary { font-weight:700; margin-bottom:4px }
    :host ::ng-deep .p-toast .p-toast-message .p-toast-detail { color: #0f172a; opacity: 0.92 }

    /* Severity-specific visual tweaks */
    :host ::ng-deep .p-toast .p-toast-message.toast-success { background: linear-gradient(90deg,#ecfdf5,#d1fae5); border-color: rgba(16,185,129,0.12) }
    :host ::ng-deep .p-toast .p-toast-message.toast-info { background: linear-gradient(90deg,#f0f9ff,#e6f6ff); border-color: rgba(59,130,246,0.08) }
    :host ::ng-deep .p-toast .p-toast-message.toast-warn { background: linear-gradient(90deg,#fffbeb,#ffedd5); border-color: rgba(245,158,11,0.08) }
    :host ::ng-deep .p-toast .p-toast-message.toast-error { background: linear-gradient(90deg,#fff1f2,#fee2e2); border-color: rgba(239,68,68,0.12) }

    /* Custom semantic classes */
    :host ::ng-deep .p-toast .p-toast-message.toast-contrast {
       background: linear-gradient(90deg,#0b2540,#0a4da6);
       color: #fff;
    }
    :host ::ng-deep .p-toast .p-toast-message.toast-contrast .p-toast-summary { font-weight:700 }
    :host ::ng-deep .p-toast .p-toast-message.toast-secondary {
       background: #f3f4f6; color:#111; border-left:4px solid #9ca3af
    }
    :host ::ng-deep .p-toast .p-toast-message.toast-secondary .p-toast-summary { font-weight:700 }
    `
  ]
})
export class AlarmsComponent {
  // This component only hosts the Toast UI. MessageService is provided here so
  // local consumer components may inject it. If you use AlarmService (providedIn: 'root')
  // make sure MessageService is provided at the app root (see instructions).
  constructor(private _ms: MessageService) {}
}
