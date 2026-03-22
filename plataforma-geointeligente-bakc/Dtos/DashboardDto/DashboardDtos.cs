namespace SaludPublicaBackend.Dtos.DashboardDto
{
    // ═══════════════════════════════════════════════════════════
    //  FILTROS – DTOs de respuesta para catálogos del dashboard
    // ═══════════════════════════════════════════════════════════

    /// <summary>Año disponible (intersección RegistroMedico ∩ PoblacionEstado_Anual).</summary>
    public class AnioDisponibleDto
    {
        public int Anio { get; set; }
    }

    /// <summary>Categoría base de enfermedad (EsCategoriaBase = 1).</summary>
    public class CategoriaEnfermedadDto
    {
        public string CodigoGrupo { get; set; } = string.Empty;
        public string CodigoICD { get; set; } = string.Empty;
        public string NombreEnfermedad { get; set; } = string.Empty;
    }

    /// <summary>Subcategoría de enfermedad dentro de un grupo.</summary>
    public class SubcategoriaEnfermedadDto
    {
        public string CodigoICD { get; set; } = string.Empty;
        public string NombreEnfermedad { get; set; } = string.Empty;
    }

    /// <summary>Estado activo.</summary>
    public class EstadoActivoDto
    {
        public int IdEstado { get; set; }
        public string NombreEstado { get; set; } = string.Empty;
    }

    /// <summary>Rango de edad formateado.</summary>
    public class RangoEdadFiltroDto
    {
        public int IdRangoEdad { get; set; }
        public string EtiquetaRango { get; set; } = string.Empty;
    }

    /// <summary>Sexo (catálogo).</summary>
    public class SexoFiltroDto
    {
        public int IdSexo { get; set; }
        public string Descripcion { get; set; } = string.Empty;
    }

    /// <summary>Institución (ClaveInstitucion - NombreInstitucion, sin duplicados).</summary>
    public class InstitucionFiltroDto
    {
        public string ClaveInstitucion { get; set; } = string.Empty;
        public string Institucion { get; set; } = string.Empty;
    }

    /// <summary>Estrato de unidad médica.</summary>
    public class EstratoFiltroDto
    {
        public string EstratoUnidad { get; set; } = string.Empty;
    }

    // ═══════════════════════════════════════════════════════════
    //  PARÁMETROS – DTO de entrada común para endpoints filtrados
    // ═══════════════════════════════════════════════════════════

    /// <summary>Parámetros compartidos por todos los endpoints de datos del dashboard.</summary>
    public class DashboardFiltrosDto
    {
        public int AnioInicio { get; set; }
        public int AnioFin { get; set; }
        public string? CodigoGrupo { get; set; }
        public string? CodigoICD { get; set; }
        public int? IdEstado { get; set; }
        public int? IdSexo { get; set; }
        public int? IdRangoEdad { get; set; }
        public string? ClaveInstitucion { get; set; }
        public string? Estrato { get; set; }
    }

    // ═══════════════════════════════════════════════════════════
    //  INDICADORES TOTALES (KPIs)
    // ═══════════════════════════════════════════════════════════

    public class IndicadoresTotalesDto
    {
        public long TotalCasos { get; set; }
        public long TotalDefunciones { get; set; }
        public long PoblacionBase { get; set; }
        public decimal? TasaIncidencia { get; set; }
        public decimal? TasaMortalidad { get; set; }
    }

    // ═══════════════════════════════════════════════════════════
    //  TENDENCIA ANUAL (gráfica de línea)
    // ═══════════════════════════════════════════════════════════

    public class TendenciaAnualDto
    {
        public int Anio { get; set; }
        public long TotalCasos { get; set; }
        public long TotalDefunciones { get; set; }
        public long? Poblacion { get; set; }
        public decimal? TasaIncidencia { get; set; }
        public decimal? TasaMortalidad { get; set; }
    }

    // ═══════════════════════════════════════════════════════════
    //  MAPA DE ESTADOS
    // ═══════════════════════════════════════════════════════════

    public class MapaEstadoDto
    {
        public int IdEstado { get; set; }
        public string NombreEstado { get; set; } = string.Empty;
        public long Casos { get; set; }
        public long Defunciones { get; set; }
        public long? Poblacion { get; set; }
        public decimal? TasaIncidencia { get; set; }
        public decimal? TasaMortalidad { get; set; }
    }

    // ═══════════════════════════════════════════════════════════
    //  GRÁFICA POR RANGO DE EDAD
    // ═══════════════════════════════════════════════════════════

    public class GraficaEdadDto
    {
        public int IdRangoEdad { get; set; }
        public string RangoEdad { get; set; } = string.Empty;
        public long TotalCasos { get; set; }
        public long TotalDefunciones { get; set; }
    }

    // ═══════════════════════════════════════════════════════════
    //  GRÁFICA POR INSTITUCIÓN
    // ═══════════════════════════════════════════════════════════

    public class GraficaInstitucionDto
    {
        public string ClaveInstitucion { get; set; } = string.Empty;
        public string NombreInstitucion { get; set; } = string.Empty;
        public long TotalCasos { get; set; }
        public long TotalDefunciones { get; set; }
    }

    // ═══════════════════════════════════════════════════════════
    //  GRÁFICA POR ESTRATO
    // ═══════════════════════════════════════════════════════════

    public class GraficaEstratoDto
    {
        public string EstratoUnidad { get; set; } = string.Empty;
        public long TotalCasos { get; set; }
        public long TotalDefunciones { get; set; }
    }

    // ═══════════════════════════════════════════════════════════
    //  GRÁFICA DE SUBGRUPOS (Top N)
    // ═══════════════════════════════════════════════════════════

    public class GraficaSubgrupoDto
    {
        public string CodigoICD { get; set; } = string.Empty;
        public string NombreEnfermedad { get; set; } = string.Empty;
        public long TotalCasos { get; set; }
        public long TotalDefunciones { get; set; }
    }

    // ═══════════════════════════════════════════════════════════
    //  GRÁFICA DÍAS DE ESTANCIA POR EDAD
    // ═══════════════════════════════════════════════════════════

    public class GraficaDiasEstanciaDto
    {
        public int IdRangoEdad { get; set; }
        public string RangoEdad { get; set; } = string.Empty;
        public double PromedioDiasEstancia { get; set; }
        public long TotalCasos { get; set; }
    }

    // ═══════════════════════════════════════════════════════════
    //  TABLA PAGINADA
    // ═══════════════════════════════════════════════════════════

    public class TablaDatosRequestDto : DashboardFiltrosDto
    {
        public int Pagina { get; set; } = 1;
        public int RegistrosPagina { get; set; } = 100;
    }

    public class TablaDatosResponseDto
    {
        public long TotalRegistros { get; set; }
        public List<TablaDatosFilaDto> Datos { get; set; } = new();
    }

    public class TablaDatosFilaDto
    {
        public int IdRegistro { get; set; }
        public DateTime FechaIngreso { get; set; }
        public int Anio { get; set; }
        public int DiasEstancia { get; set; }
        public string NombreEstado { get; set; } = string.Empty;
        public string NombreMunicipio { get; set; } = string.Empty;
        public int Edad { get; set; }
        public string Sexo { get; set; } = string.Empty;
        public string CodigoGrupo { get; set; } = string.Empty;
        public string CodigoICD { get; set; } = string.Empty;
        public string ClaveInstitucion { get; set; } = string.Empty;
        public string NombreInstitucion { get; set; } = string.Empty;
        public string EstratoUnidad { get; set; } = string.Empty;
        public int IdMotivoEgreso { get; set; }
        public int EsDefuncion { get; set; }
    }
}
