import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { IndicadoresTotalesDto } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-metricas-clave',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './metricasClave.html',
  styleUrls: ['./metricasClave.css'],
})
export class MetricasClaveComponent {
  @Input() indicadores: IndicadoresTotalesDto | null = null;
}
