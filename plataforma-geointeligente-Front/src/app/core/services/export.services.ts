import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import { AuthService } from '../../core/services/auth.service';
import { LogoService } from './logo.service';

type PdfOptions = {
  title?: string;
  subtitle?: string; // Ej: "Periodo: ... / Filtros: ..."
  orientation?: 'p' | 'l'; // portrait/landscape
  pageNumbers?: boolean; // "Página X de Y"
  repeatHeader?: boolean; // autoTable ya repite head, esto es más para header del doc
  includeSummary?: boolean; // resumen al inicio
  columnLabels?: Record<string, string>; // renombrar columnas
  formatters?: Record<string, (value: any, row?: any) => any>; // formatear valores
  fontSize?: number;
  headFillColor?: [number, number, number];
  zebra?: boolean;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  // si quieres forzar anchos por columna:
  columnStyles?: Record<string | number, any>;
};

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor(
    private AuthService: AuthService,
    private logoService: LogoService
  ) {}

  /** Exportar datos como CSV */
  exportToCSV(data: any[], filename: string): void {
    if (!data || !data.length) return;

    const csvRows: string[] = [];
    const headers = Object.keys(data[0]);
    const user = this.AuthService.getCurrentUser();
    const userName = user ? user.name : 'Desconocido';
    const date = new Date().toLocaleString();

    csvRows.push(`"Generado por:","${userName}"`);
    csvRows.push(`"Fecha:","${date}"`);
    csvRows.push(headers.join(','));
    for (const row of data) {
      const values = headers.map((h) => JSON.stringify(row[h] ?? ''));
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /** Exportar datos como PDF */

  async exportToPDF(
    data: any[],
    columns: string[],
    filename: string,
    options: PdfOptions = {},
  ): Promise<void> {
    if (!data?.length) return;

    const user = this.AuthService.getCurrentUser();
    const userName = user?.name ?? 'Desconocido';
    const date = new Date().toLocaleString();

    const {
      title = 'Reporte de Datos',
      subtitle,
      orientation = columns.length > 8 ? 'l' : 'p',
      pageNumbers = true,
      includeSummary = false,
      columnLabels = {},
      formatters = {},
      fontSize = 8,
      headFillColor = [63, 49, 199],
      zebra = true,
      margin = { top: 28, left: 14, right: 14, bottom: 12 },
      columnStyles,
    } = options;

    const doc = new jsPDF({ orientation });

    // Obtener el logo activo desde el servicio
    const logoData = await this.logoService.getActiveLogoDataUrl();
    let logoDataUrl = '';
    let logoFmt: 'PNG' | 'JPEG' = 'PNG';

    if (logoData) {
      logoDataUrl = logoData.dataUrl;
      logoFmt = logoData.format;
      console.log('[ExportService] Logo obtenido. Formato:', logoFmt, 'DataUrl length:', logoDataUrl.length, 'Inicio:', logoDataUrl.substring(0, 50));
    } else {
      console.warn('[ExportService] No hay logo activo configurado — PDF sin logo');
    }

    const totalPagesExp = '{total_pages_count_string}';

    const headLabels = columns.map((c) => columnLabels[c] ?? c);

    // Body
    const tableBody: RowInput[] = data.map((row) =>
      columns.map((col) => {
        const raw = row?.[col];
        const formatted = formatters[col] ? formatters[col](raw, row) : raw;
        return formatted ?? '';
      }),
    );

    // ===== Header
    const drawDocHeader = () => {
      const left = margin.left ?? 14;
      const right = margin.right ?? 14;

      const pageWidth = doc.internal.pageSize.getWidth();

      const logoW = 20;
      const logoH = 20;

      const logoX = pageWidth - right - logoW;
      const logoY = 8;

      const hasLogo = !!logoDataUrl && logoDataUrl.startsWith('data:image/');

      if (hasLogo) {
        doc.addImage(logoDataUrl, logoFmt, logoX, logoY, logoW, logoH);
      }

      doc.setFontSize(14);
      doc.text(title, left, 14);

      doc.setFontSize(10);
      doc.text(`Generado por: ${userName}`, left, 19);
      doc.text(`Fecha: ${date}`, left, 24);

      if (subtitle) {
        doc.text(subtitle, left, 28);
      }
    };

    const normalizedColumnStyles: Record<number, any> = {};

    if (columnStyles) {
      for (const [k, style] of Object.entries(columnStyles)) {
        const asNum = Number(k);
        if (!Number.isNaN(asNum) && k.trim() !== '') {
          normalizedColumnStyles[asNum] = style;
          continue;
        }

        const idx = columns.indexOf(k);
        if (idx >= 0) normalizedColumnStyles[idx] = style;
      }
    }

    autoTable(doc, {
      head: [headLabels],
      body: tableBody,
      startY: 30,
      theme: 'grid',
      styles: {
        fontSize,
        cellPadding: 2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: headFillColor,
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: zebra ? { fillColor: [245, 245, 245] } : undefined,

      tableWidth: 'auto',
      columnStyles: normalizedColumnStyles,

      didDrawPage: () => {
        drawDocHeader();

        // Footer con paginación
        if (pageNumbers) {
          const pageCount = doc.getNumberOfPages();
          const pageCurrent = doc.getCurrentPageInfo().pageNumber;

          doc.setFontSize(9);
          const pageWidth = doc.internal.pageSize.getWidth();
          const y = doc.internal.pageSize.getHeight() - (margin.bottom ?? 12) + 6;

          doc.text(`Página ${pageCurrent} de ${totalPagesExp}`, pageWidth - 14, y, {
            align: 'right',
          });
        }
      },
      margin: { top: 30, left: 14, right: 14, bottom: 12 },
    });
    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp);
    }
    doc.save(`${filename}.pdf`);
  }

  /** Exportar datos como JSON */
  exportToJSON(data: any[], filename: string): void {
    if (!data || !data.length) return;

    const user = this.AuthService.getCurrentUser();
    const userName = user ? user.name : 'Desconocido';
    const date = new Date().toISOString();

    // Creamos un objeto que contenga metadatos y datos
    const exportData = {
      generatedBy: userName,
      generatedAt: date,
      records: data,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${filename}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /** Exportar reporte completo del dashboard epidemiológico */
  async exportDashboardPDF(params: {
    filterSummary: { label: string; value: string }[];
    indicadores: { label: string; value: string }[];
    chartImages: { title: string; dataUrl: string }[];
    mapImages: { title: string; dataUrl: string }[];
    tableData: any[];
    tableColumns: { key: string; label: string }[];
    totalRegistros: number;
  }): Promise<void> {
    const {
      filterSummary, indicadores, chartImages, mapImages,
      tableData, tableColumns, totalRegistros,
    } = params;

    const user = this.AuthService.getCurrentUser();
    const userName = user?.name ?? 'Desconocido';
    const date = new Date().toLocaleString();
    const title = 'Reporte Epidemiológico – Paneles Generales';
    const totalPagesExp = '{total_pages_count_string}';

    const doc = new jsPDF({ orientation: 'l' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const ml = 14, mr = 14, mt = 30, mb = 14;
    const contentW = pageW - ml - mr;

    // Logo
    const logoData = await this.logoService.getActiveLogoDataUrl();
    let logoDataUrl = '';
    let logoFmt: 'PNG' | 'JPEG' = 'PNG';
    if (logoData) {
      logoDataUrl = logoData.dataUrl;
      logoFmt = logoData.format;
    }

    const drawHeader = () => {
      const hasLogo = !!logoDataUrl && logoDataUrl.startsWith('data:image/');
      if (hasLogo) {
        doc.addImage(logoDataUrl, logoFmt, pageW - mr - 20, 8, 20, 20);
      }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(title, ml, 14);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Generado por: ${userName}`, ml, 19);
      doc.text(`Fecha: ${date}`, ml, 24);
    };

    // ===== PAGE 1: Filters + Metrics =====
    let y = 32;

    // Filters Summary
    if (filterSummary.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Filtros Aplicados', ml, y);
      y += 2;

      autoTable(doc, {
        startY: y,
        head: [['Filtro', 'Valor']],
        body: filterSummary.map(f => [f.label, f.value]),
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [63, 49, 199], textColor: 255, fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 55, fontStyle: 'bold' } },
        margin: { left: ml, right: pageW / 2 },
        tableWidth: 'auto',
      });
      y = (doc as any).lastAutoTable.finalY + 8;
    }

    // Indicators
    if (indicadores.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Indicadores Clave', ml, y);
      y += 2;

      autoTable(doc, {
        startY: y,
        head: [indicadores.map(i => i.label)],
        body: [indicadores.map(i => i.value)],
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3, halign: 'center' },
        headStyles: { fillColor: [63, 49, 199], textColor: 255, fontStyle: 'bold', halign: 'center' },
        margin: { left: ml, right: mr },
        tableWidth: 'auto',
      });
      y = (doc as any).lastAutoTable.finalY + 8;
    }

    // ===== CHARTS PAGES =====
    if (chartImages.length > 0) {
      const chartH = 70;
      const titleH = 8;
      const gap = 4;
      const maxY = pageH - mb - 10;

      for (const chart of chartImages) {
        if (y + titleH + chartH > maxY) {
          doc.addPage();
          y = mt + 2;
        }

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(chart.title, ml, y);
        y += 4;

        try {
          doc.addImage(chart.dataUrl, 'PNG', ml, y, contentW, chartH);
        } catch {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.text(`[No se pudo renderizar: ${chart.title}]`, ml, y + chartH / 2);
        }
        y += chartH + gap;
      }
    }

    // ===== MAPS PAGE =====
    if (mapImages.length > 0) {
      doc.addPage();
      y = mt + 2;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Mapas Epidemiológicos', ml, y);
      y += 6;

      const gapBetween = 6;
      const mapW = (contentW - gapBetween * (mapImages.length - 1)) / mapImages.length;
      const mapH = mapW * 0.75;

      for (let i = 0; i < mapImages.length; i++) {
        const x = ml + i * (mapW + gapBetween);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(mapImages[i].title, x + mapW / 2, y, { align: 'center' });

        try {
          doc.addImage(mapImages[i].dataUrl, 'PNG', x, y + 3, mapW, mapH);
        } catch { /* skip */ }
      }
      y += mapH + 14;
    }

    // ===== TABLE PAGE(S) =====
    if (tableData.length > 0) {
      doc.addPage();

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Tabla de Datos (${totalRegistros.toLocaleString()} registros totales)`, ml, mt + 2);

      const headLabels = tableColumns.map(c => c.label);
      const body: RowInput[] = tableData.map(row =>
        tableColumns.map(c => {
          const v = row?.[c.key];
          return v ?? '';
        }),
      );

      autoTable(doc, {
        head: [headLabels],
        body,
        startY: mt + 6,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1.5, overflow: 'linebreak' },
        headStyles: {
          fillColor: [63, 49, 199],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 7,
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: mt, left: ml, right: mr, bottom: mb },
      });
    }

    // ===== Draw Header + Footer on ALL pages =====
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      drawHeader();

      // Footer
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Página ${i} de ${totalPagesExp}`,
        pageW - mr, pageH - mb + 6,
        { align: 'right' },
      );
    }

    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp);
    }

    doc.save('reporte-paneles-generales.pdf');
  }
}
