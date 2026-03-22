import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

export type AlarmOptions = {
  detail?: string;
  life?: number; // ms
  sticky?: boolean;
  key?: string;
  styleClass?: string;
};

@Injectable({ providedIn: 'root' })
export class AlarmService {
  constructor(private messageService: MessageService) {}

  private defaultKey() { return 'br'; }

  private push(severity: string, summary: string, options: AlarmOptions = {}, defaultLife?: number, styleClass?: string) {
    const payload: any = {
      severity,
      summary,
      detail: options.detail,
      life: options.life ?? defaultLife ?? 4000,
      sticky: options.sticky,
      key: options.key ?? this.defaultKey()
    };
    // choose a default styleClass per severity when none supplied
    const severityClassMap: any = {
      success: 'toast-success',
      info: 'toast-info',
      warn: 'toast-warn',
      error: 'toast-error'
    };
    payload.styleClass = options.styleClass ?? styleClass ?? severityClassMap[severity] ?? '';
    this.messageService.add(payload);
  }

  showSuccess(summary: string, options: AlarmOptions = {}) {
    this.push('success', summary, options, 4000);
  }

  showInfo(summary: string, options: AlarmOptions = {}) {
    this.push('info', summary, options, 4000);
  }

  showWarn(summary: string, options: AlarmOptions = {}) {
    this.push('warn', summary, options, 4000);
  }

  showError(summary: string, options: AlarmOptions = {}) {
    this.push('error', summary, options, 6000);
  }

  // extra helpers for custom 'secondary' and 'contrast' visualizations
  showSecondary(summary: string, options: AlarmOptions = {}) {
    // map to info but with longer life by default and custom style
    this.push('info', summary, options, 5000, 'toast-secondary');
  }

  showContrast(summary: string, options: AlarmOptions = {}) {
    // use warn severity but provide a contrast style class
    this.push('warn', summary, options, 5000, 'toast-contrast');
  }

  // convenience: show specifically at bottom-right
  showBottomRight(summary: string, options: AlarmOptions = {}) {
    options.key = options.key ?? 'br';
    this.push('info', summary, options, options.life ?? 4000);
  }

  // clear toasts by key or all
  clear(key?: string) {
    if (key) this.messageService.clear(key);
    else this.messageService.clear();
  }
}
