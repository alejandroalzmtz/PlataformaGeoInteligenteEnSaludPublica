using SaludPublicaBackend.Dtos.DashboardDto;

namespace SaludPublicaBackend.Services.DashboardService
{
    /// <summary>
    /// Servicio del dashboard epidemiológico.
    /// Llama a las vistas y procedimientos almacenados de la BD.
    /// </summary>
    public interface IDashboardService
    {
        // ── Catálogos / Filtros ──────────────────────────────

        Task<List<AnioDisponibleDto>> GetAniosDisponiblesAsync();
        Task<List<CategoriaEnfermedadDto>> GetCategoriasBaseAsync();
        Task<List<SubcategoriaEnfermedadDto>> GetSubcategoriasAsync(string codigoGrupo);
        Task<List<EstadoActivoDto>> GetEstadosActivosAsync();
        Task<List<RangoEdadFiltroDto>> GetRangosEdadAsync();
        Task<List<SexoFiltroDto>> GetSexosAsync();
        Task<List<InstitucionFiltroDto>> GetInstitucionesAsync();
        Task<List<EstratoFiltroDto>> GetEstratosAsync();

        // ── Datos del dashboard ──────────────────────────────

        Task<IndicadoresTotalesDto> GetIndicadoresTotalesAsync(DashboardFiltrosDto filtros);
        Task<List<TendenciaAnualDto>> GetTendenciaAsync(DashboardFiltrosDto filtros);
        Task<List<MapaEstadoDto>> GetMapaEstadosAsync(DashboardFiltrosDto filtros);
        Task<List<GraficaEdadDto>> GetGraficaEdadesAsync(DashboardFiltrosDto filtros);
        Task<List<GraficaInstitucionDto>> GetGraficaInstitucionesAsync(DashboardFiltrosDto filtros);
        Task<List<GraficaEstratoDto>> GetGraficaEstratosAsync(DashboardFiltrosDto filtros);
        Task<List<GraficaSubgrupoDto>> GetGraficaSubgruposAsync(DashboardFiltrosDto filtros, int topN = 20);
        Task<List<GraficaDiasEstanciaDto>> GetGraficaDiasEstanciaAsync(DashboardFiltrosDto filtros);
        Task<TablaDatosResponseDto> GetTablaDatosAsync(TablaDatosRequestDto request);
    }
}
