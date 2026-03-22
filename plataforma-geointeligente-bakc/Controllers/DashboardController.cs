using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaludPublicaBackend.Configurations.CustomHttpResponses;
using SaludPublicaBackend.Dtos.DashboardDto;
using SaludPublicaBackend.Services.DashboardService;

namespace SaludPublicaBackend.Controllers
{
    /// <summary>
    /// Controlador del dashboard epidemiológico.
    /// Expone catálogos para filtros y datos procesados por procedimientos almacenados.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(
            IDashboardService dashboardService,
            ILogger<DashboardController> logger)
        {
            _dashboardService = dashboardService;
            _logger = logger;
        }

        // ═══════════════════════ HELPER ═══════════════════════

        private async Task<ActionResult<T>> Exec<T>(
            Func<Task<T>> call, T fallback, string op)
        {
            try
            {
                var result = await call();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[{Op}] Error: {Msg}", op, ex.Message);
                return Ok(fallback);
            }
        }

        // ═══════════════════════════════════════════════════════
        //  FILTROS / CATÁLOGOS
        // ═══════════════════════════════════════════════════════

        /// <summary>Años con datos disponibles (intersección registros ∩ población).</summary>
        [HttpGet("filtros/anios-disponibles")]
        [ProducesResponseType(typeof(List<AnioDisponibleDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public Task<ActionResult<List<AnioDisponibleDto>>> GetAniosDisponibles()
            => Exec(() => _dashboardService.GetAniosDisponiblesAsync(),
                    new List<AnioDisponibleDto>(), nameof(GetAniosDisponibles));

        /// <summary>Categorías base de enfermedad (código que termina en 0).</summary>
        [HttpGet("filtros/categorias-enfermedad")]
        [ProducesResponseType(typeof(List<CategoriaEnfermedadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public Task<ActionResult<List<CategoriaEnfermedadDto>>> GetCategoriasEnfermedad()
            => Exec(() => _dashboardService.GetCategoriasBaseAsync(),
                    new List<CategoriaEnfermedadDto>(), nameof(GetCategoriasEnfermedad));

        /// <summary>Subcategorías de enfermedad dentro de un grupo.</summary>
        [HttpGet("filtros/subcategorias-enfermedad")]
        [ProducesResponseType(typeof(List<SubcategoriaEnfermedadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public Task<ActionResult<List<SubcategoriaEnfermedadDto>>> GetSubcategoriasEnfermedad(
            [FromQuery] string codigoGrupo)
        {
            if (string.IsNullOrWhiteSpace(codigoGrupo))
                return Task.FromResult<ActionResult<List<SubcategoriaEnfermedadDto>>>(
                    BadRequest("El parámetro 'codigoGrupo' es requerido."));

            return Exec(() => _dashboardService.GetSubcategoriasAsync(codigoGrupo),
                        new List<SubcategoriaEnfermedadDto>(), nameof(GetSubcategoriasEnfermedad));
        }

        /// <summary>Estados activos.</summary>
        [HttpGet("filtros/estados")]
        [ProducesResponseType(typeof(List<EstadoActivoDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public Task<ActionResult<List<EstadoActivoDto>>> GetEstadosActivos()
            => Exec(() => _dashboardService.GetEstadosActivosAsync(),
                    new List<EstadoActivoDto>(), nameof(GetEstadosActivos));

        /// <summary>Rangos de edad con etiqueta formateada.</summary>
        [HttpGet("filtros/rangos-edad")]
        [ProducesResponseType(typeof(List<RangoEdadFiltroDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public Task<ActionResult<List<RangoEdadFiltroDto>>> GetRangosEdad()
            => Exec(() => _dashboardService.GetRangosEdadAsync(),
                    new List<RangoEdadFiltroDto>(), nameof(GetRangosEdad));

        /// <summary>Sexos disponibles.</summary>
        [HttpGet("filtros/sexos")]
        [ProducesResponseType(typeof(List<SexoFiltroDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public Task<ActionResult<List<SexoFiltroDto>>> GetSexos()
            => Exec(() => _dashboardService.GetSexosAsync(),
                    new List<SexoFiltroDto>(), nameof(GetSexos));

        /// <summary>Instituciones (ClaveInstitucion + nombre, sin duplicados).</summary>
        [HttpGet("filtros/instituciones")]
        [ProducesResponseType(typeof(List<InstitucionFiltroDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public Task<ActionResult<List<InstitucionFiltroDto>>> GetInstituciones()
            => Exec(() => _dashboardService.GetInstitucionesAsync(),
                    new List<InstitucionFiltroDto>(), nameof(GetInstituciones));

        /// <summary>Estratos de unidad médica.</summary>
        [HttpGet("filtros/estratos")]
        [ProducesResponseType(typeof(List<EstratoFiltroDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public Task<ActionResult<List<EstratoFiltroDto>>> GetEstratos()
            => Exec(() => _dashboardService.GetEstratosAsync(),
                    new List<EstratoFiltroDto>(), nameof(GetEstratos));

        // ═══════════════════════════════════════════════════════
        //  DATOS DEL DASHBOARD
        // ═══════════════════════════════════════════════════════

        /// <summary>KPIs globales: total casos, defunciones, tasas.</summary>
        [HttpGet("indicadores")]
        [ProducesResponseType(typeof(IndicadoresTotalesDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public Task<ActionResult<IndicadoresTotalesDto>> GetIndicadores(
            [FromQuery] DashboardFiltrosDto filtros)
            => Exec(() => _dashboardService.GetIndicadoresTotalesAsync(filtros),
                    new IndicadoresTotalesDto(), nameof(GetIndicadores));

        /// <summary>Tendencia anual (gráfica de línea).</summary>
        [HttpGet("tendencia")]
        [ProducesResponseType(typeof(List<TendenciaAnualDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public Task<ActionResult<List<TendenciaAnualDto>>> GetTendencia(
            [FromQuery] DashboardFiltrosDto filtros)
            => Exec(() => _dashboardService.GetTendenciaAsync(filtros),
                    new List<TendenciaAnualDto>(), nameof(GetTendencia));

        /// <summary>Mapa de calor: un registro por estado con tasas.</summary>
        [HttpGet("mapa-estados")]
        [ProducesResponseType(typeof(List<MapaEstadoDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public Task<ActionResult<List<MapaEstadoDto>>> GetMapaEstados(
            [FromQuery] DashboardFiltrosDto filtros)
            => Exec(() => _dashboardService.GetMapaEstadosAsync(filtros),
                    new List<MapaEstadoDto>(), nameof(GetMapaEstados));

        /// <summary>Comparativa por rango de edad (no se muestra si se filtró por rango).</summary>
        [HttpGet("grafica-edades")]
        [ProducesResponseType(typeof(List<GraficaEdadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public Task<ActionResult<List<GraficaEdadDto>>> GetGraficaEdades(
            [FromQuery] DashboardFiltrosDto filtros)
            => Exec(() => _dashboardService.GetGraficaEdadesAsync(filtros),
                    new List<GraficaEdadDto>(), nameof(GetGraficaEdades));

        /// <summary>Comparativa por institución (no se muestra si se filtró por institución).</summary>
        [HttpGet("grafica-instituciones")]
        [ProducesResponseType(typeof(List<GraficaInstitucionDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public Task<ActionResult<List<GraficaInstitucionDto>>> GetGraficaInstituciones(
            [FromQuery] DashboardFiltrosDto filtros)
            => Exec(() => _dashboardService.GetGraficaInstitucionesAsync(filtros),
                    new List<GraficaInstitucionDto>(), nameof(GetGraficaInstituciones));

        /// <summary>Comparativa por estrato (no se muestra si se filtró por estrato).</summary>
        [HttpGet("grafica-estratos")]
        [ProducesResponseType(typeof(List<GraficaEstratoDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public Task<ActionResult<List<GraficaEstratoDto>>> GetGraficaEstratos(
            [FromQuery] DashboardFiltrosDto filtros)
            => Exec(() => _dashboardService.GetGraficaEstratosAsync(filtros),
                    new List<GraficaEstratoDto>(), nameof(GetGraficaEstratos));

        /// <summary>Top N subcategorías de enfermedad (no se muestra si se filtró por subcategoría).</summary>
        [HttpGet("grafica-subgrupos")]
        [ProducesResponseType(typeof(List<GraficaSubgrupoDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public Task<ActionResult<List<GraficaSubgrupoDto>>> GetGraficaSubgrupos(
            [FromQuery] DashboardFiltrosDto filtros,
            [FromQuery] int topN = 20)
            => Exec(() => _dashboardService.GetGraficaSubgruposAsync(filtros, topN),
                    new List<GraficaSubgrupoDto>(), nameof(GetGraficaSubgrupos));

        /// <summary>Promedio de días de estancia por rango de edad.</summary>
        [HttpGet("grafica-dias-estancia")]
        [ProducesResponseType(typeof(List<GraficaDiasEstanciaDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public Task<ActionResult<List<GraficaDiasEstanciaDto>>> GetGraficaDiasEstancia(
            [FromQuery] DashboardFiltrosDto filtros)
            => Exec(() => _dashboardService.GetGraficaDiasEstanciaAsync(filtros),
                    new List<GraficaDiasEstanciaDto>(), nameof(GetGraficaDiasEstancia));

        /// <summary>Tabla paginada de registros médicos filtrados.</summary>
        [HttpGet("tabla")]
        [ProducesResponseType(typeof(TablaDatosResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public Task<ActionResult<TablaDatosResponseDto>> GetTablaDatos(
            [FromQuery] TablaDatosRequestDto request)
            => Exec(() => _dashboardService.GetTablaDatosAsync(request),
                    new TablaDatosResponseDto(), nameof(GetTablaDatos));
    }
}
