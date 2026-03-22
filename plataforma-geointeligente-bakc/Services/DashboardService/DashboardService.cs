using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using SaludPublicaBackend.Configurations.Databases;
using SaludPublicaBackend.Dtos.DashboardDto;
using System.Data;
using System.Data.Common;

namespace SaludPublicaBackend.Services.DashboardService
{
    /// <summary>
    /// Implementación del servicio de dashboard.
    /// Ejecuta directamente las vistas y procedimientos almacenados de la BD
    /// usando ADO.NET sobre la conexión de EF Core.
    /// </summary>
    public class DashboardService : IDashboardService
    {
        private readonly AppDbContext _context;

        public DashboardService(AppDbContext context)
        {
            _context = context;
        }

        #region ── Helpers ADO.NET ─────────────────────────────

        private static double SafeDouble(object val)
            => val == DBNull.Value ? 0.0 : Convert.ToDouble(val);

        private static int SafeInt(object val)
            => val == DBNull.Value ? 0 : Convert.ToInt32(val);

        private static long SafeLong(object val)
            => val == DBNull.Value ? 0L : Convert.ToInt64(val);

        private static string SafeStr(object val)
            => val == DBNull.Value ? string.Empty : val.ToString()!;

        private static DateTime SafeDt(object val)
            => val == DBNull.Value ? DateTime.MinValue : Convert.ToDateTime(val);

        private static decimal? SafeDecimalNull(object val)
            => val == DBNull.Value ? null : Convert.ToDecimal(val);

        private static long? SafeLongNull(object val)
            => val == DBNull.Value ? null : Convert.ToInt64(val);

        private static SqlParameter P(string name, object? value, SqlDbType type, int size = 0)
        {
            var p = size > 0 ? new SqlParameter(name, type, size) : new SqlParameter(name, type);
            p.Value = value ?? DBNull.Value;
            return p;
        }

        /// <summary>Ejecuta un SELECT sobre una vista y mapea todas las filas.</summary>
        private async Task<List<T>> ViewListAsync<T>(string sql, Func<DbDataReader, T> map)
        {
            var list = new List<T>();
            var conn = _context.Database.GetDbConnection();
            var wasOpen = conn.State == ConnectionState.Open;
            if (!wasOpen) await conn.OpenAsync();
            try
            {
                await using var cmd = conn.CreateCommand();
                cmd.CommandText = sql;
                cmd.CommandType = CommandType.Text;
                cmd.CommandTimeout = 60;

                await using var rdr = await cmd.ExecuteReaderAsync();
                while (await rdr.ReadAsync()) list.Add(map(rdr));
            }
            finally { if (!wasOpen) await conn.CloseAsync(); }
            return list;
        }

        /// <summary>Ejecuta un SP y mapea todas las filas.</summary>
        private async Task<List<T>> SpListAsync<T>(
            string sp, Action<List<SqlParameter>> addParams, Func<DbDataReader, T> map)
        {
            var list = new List<T>();
            var conn = _context.Database.GetDbConnection();
            var wasOpen = conn.State == ConnectionState.Open;
            if (!wasOpen) await conn.OpenAsync();
            try
            {
                await using var cmd = conn.CreateCommand();
                cmd.CommandText = sp;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 120;
                var parms = new List<SqlParameter>();
                addParams(parms);
                foreach (var p in parms) cmd.Parameters.Add(p);

                await using var rdr = await cmd.ExecuteReaderAsync();
                while (await rdr.ReadAsync()) list.Add(map(rdr));
            }
            finally { if (!wasOpen) await conn.CloseAsync(); }
            return list;
        }

        /// <summary>Ejecuta un SP y mapea la primera fila (o default).</summary>
        private async Task<T?> SpSingleAsync<T>(
            string sp, Action<List<SqlParameter>> addParams, Func<DbDataReader, T> map) where T : class
        {
            var conn = _context.Database.GetDbConnection();
            var wasOpen = conn.State == ConnectionState.Open;
            if (!wasOpen) await conn.OpenAsync();
            try
            {
                await using var cmd = conn.CreateCommand();
                cmd.CommandText = sp;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 120;
                var parms = new List<SqlParameter>();
                addParams(parms);
                foreach (var p in parms) cmd.Parameters.Add(p);

                await using var rdr = await cmd.ExecuteReaderAsync();
                return await rdr.ReadAsync() ? map(rdr) : null;
            }
            finally { if (!wasOpen) await conn.CloseAsync(); }
        }

        /// <summary>Ejecuta un SP que devuelve dos result-sets (tabla paginada).</summary>
        private async Task<TablaDatosResponseDto> SpTablaPaginadaAsync(
            string sp, Action<List<SqlParameter>> addParams)
        {
            var response = new TablaDatosResponseDto();
            var conn = _context.Database.GetDbConnection();
            var wasOpen = conn.State == ConnectionState.Open;
            if (!wasOpen) await conn.OpenAsync();
            try
            {
                await using var cmd = conn.CreateCommand();
                cmd.CommandText = sp;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 120;
                var parms = new List<SqlParameter>();
                addParams(parms);
                foreach (var p in parms) cmd.Parameters.Add(p);

                await using var rdr = await cmd.ExecuteReaderAsync();

                // Primer result-set: TotalRegistros
                if (await rdr.ReadAsync())
                    response.TotalRegistros = SafeLong(rdr["TotalRegistros"]);

                // Segundo result-set: filas de datos
                if (await rdr.NextResultAsync())
                {
                    while (await rdr.ReadAsync())
                    {
                        response.Datos.Add(new TablaDatosFilaDto
                        {
                            IdRegistro = SafeInt(rdr["idRegistro"]),
                            FechaIngreso = SafeDt(rdr["fechaIngreso"]),
                            Anio = SafeInt(rdr["Anio"]),
                            DiasEstancia = SafeInt(rdr["diasEstancia"]),
                            NombreEstado = SafeStr(rdr["nombreEstado"]),
                            NombreMunicipio = SafeStr(rdr["nombreMunicipio"]),
                            Edad = SafeInt(rdr["edad"]),
                            Sexo = SafeStr(rdr["Sexo"]),
                            CodigoGrupo = SafeStr(rdr["CodigoGrupo"]),
                            CodigoICD = SafeStr(rdr["codigoICD"]),
                            ClaveInstitucion = SafeStr(rdr["ClaveInstitucion"]),
                            NombreInstitucion = SafeStr(rdr["NombreInstitucion"]),
                            EstratoUnidad = SafeStr(rdr["EstratoUnidad"]),
                            IdMotivoEgreso = SafeInt(rdr["idMotivoEgreso"]),
                            EsDefuncion = SafeInt(rdr["EsDefuncion"])
                        });
                    }
                }
            }
            finally { if (!wasOpen) await conn.CloseAsync(); }
            return response;
        }

        /// <summary>Agrega los parámetros comunes de filtro a un SP del dashboard.</summary>
        private static void AddFiltrosComunes(List<SqlParameter> parms, DashboardFiltrosDto f)
        {
            parms.Add(P("@AnioInicio", f.AnioInicio, SqlDbType.Int));
            parms.Add(P("@AnioFin", f.AnioFin, SqlDbType.Int));
            parms.Add(P("@CodigoGrupo", f.CodigoGrupo, SqlDbType.VarChar, 255));
            parms.Add(P("@CodigoICD", f.CodigoICD, SqlDbType.VarChar, 50));
            parms.Add(P("@IdEstado", f.IdEstado, SqlDbType.Int));
            parms.Add(P("@IdSexo", f.IdSexo, SqlDbType.Int));
            parms.Add(P("@IdRangoEdad", f.IdRangoEdad, SqlDbType.Int));
            parms.Add(P("@ClaveInstitucion", f.ClaveInstitucion, SqlDbType.NVarChar, 50));
            parms.Add(P("@Estrato", f.Estrato, SqlDbType.NVarChar, 50));
        }

        #endregion

        // ═══════════════════════════════════════════════════════
        //  CATÁLOGOS / FILTROS  (vistas + SPs de catálogo)
        // ═══════════════════════════════════════════════════════

        public Task<List<AnioDisponibleDto>> GetAniosDisponiblesAsync()
            => ViewListAsync(
                "SELECT Anio FROM dbo.vw_AniosDisponibles ORDER BY Anio",
                r => new AnioDisponibleDto { Anio = SafeInt(r["Anio"]) });

        public Task<List<CategoriaEnfermedadDto>> GetCategoriasBaseAsync()
            => SpListAsync("dbo.sp_ObtenerCategoriasBase",
                _ => { },
                r => new CategoriaEnfermedadDto
                {
                    CodigoGrupo = SafeStr(r["CodigoGrupo"]),
                    CodigoICD = SafeStr(r["codigoICD"]),
                    NombreEnfermedad = SafeStr(r["nombreEnfermedad"])
                });

        public Task<List<SubcategoriaEnfermedadDto>> GetSubcategoriasAsync(string codigoGrupo)
            => SpListAsync("dbo.sp_ObtenerSubcategorias",
                p => p.Add(P("@CodigoGrupo", codigoGrupo, SqlDbType.VarChar, 3)),
                r => new SubcategoriaEnfermedadDto
                {
                    CodigoICD = SafeStr(r["codigoICD"]),
                    NombreEnfermedad = SafeStr(r["nombreEnfermedad"])
                });

        public Task<List<EstadoActivoDto>> GetEstadosActivosAsync()
            => ViewListAsync(
                "SELECT idEstado, nombreEstado FROM dbo.vw_EstadosActivos ORDER BY nombreEstado",
                r => new EstadoActivoDto
                {
                    IdEstado = SafeInt(r["idEstado"]),
                    NombreEstado = SafeStr(r["nombreEstado"])
                });

        public Task<List<RangoEdadFiltroDto>> GetRangosEdadAsync()
            => ViewListAsync(
                "SELECT idRangoEdad, EtiquetaRango FROM dbo.vw_FiltroRangoEdad ORDER BY idRangoEdad",
                r => new RangoEdadFiltroDto
                {
                    IdRangoEdad = SafeInt(r["idRangoEdad"]),
                    EtiquetaRango = SafeStr(r["EtiquetaRango"])
                });

        public Task<List<SexoFiltroDto>> GetSexosAsync()
            => ViewListAsync(
                "SELECT idSexo, descripcion FROM dbo.vw_FiltroSexo ORDER BY idSexo",
                r => new SexoFiltroDto
                {
                    IdSexo = SafeInt(r["idSexo"]),
                    Descripcion = SafeStr(r["descripcion"])
                });

        public Task<List<InstitucionFiltroDto>> GetInstitucionesAsync()
            => ViewListAsync(
                "SELECT ClaveInstitucion, Institucion FROM dbo.vw_Instituciones ORDER BY ClaveInstitucion",
                r => new InstitucionFiltroDto
                {
                    ClaveInstitucion = SafeStr(r["ClaveInstitucion"]),
                    Institucion = SafeStr(r["Institucion"])
                });

        public Task<List<EstratoFiltroDto>> GetEstratosAsync()
            => ViewListAsync(
                "SELECT EstratoUnidad FROM dbo.vw_Estratos ORDER BY EstratoUnidad",
                r => new EstratoFiltroDto
                {
                    EstratoUnidad = SafeStr(r["EstratoUnidad"])
                });

        // ═══════════════════════════════════════════════════════
        //  INDICADORES TOTALES  →  sp_Dashboard_IndicadoresTotales
        // ═══════════════════════════════════════════════════════

        public async Task<IndicadoresTotalesDto> GetIndicadoresTotalesAsync(DashboardFiltrosDto filtros)
        {
            var dto = await SpSingleAsync("dbo.sp_Dashboard_IndicadoresTotales",
                p => AddFiltrosComunes(p, filtros),
                r => new IndicadoresTotalesDto
                {
                    TotalCasos = SafeLong(r["TotalCasos"]),
                    TotalDefunciones = SafeLong(r["TotalDefunciones"]),
                    PoblacionBase = SafeLong(r["PoblacionBase"]),
                    TasaIncidencia = SafeDecimalNull(r["TasaIncidencia"]),
                    TasaMortalidad = SafeDecimalNull(r["TasaMortalidad"])
                });
            return dto ?? new IndicadoresTotalesDto();
        }

        // ═══════════════════════════════════════════════════════
        //  TENDENCIA ANUAL  →  sp_Dashboard_GraficaTendencia
        // ═══════════════════════════════════════════════════════

        public Task<List<TendenciaAnualDto>> GetTendenciaAsync(DashboardFiltrosDto filtros)
            => SpListAsync("dbo.sp_Dashboard_GraficaTendencia",
                p => AddFiltrosComunes(p, filtros),
                r => new TendenciaAnualDto
                {
                    Anio = SafeInt(r["Anio"]),
                    TotalCasos = SafeLong(r["TotalCasos"]),
                    TotalDefunciones = SafeLong(r["TotalDefunciones"]),
                    Poblacion = SafeLongNull(r["Poblacion"]),
                    TasaIncidencia = SafeDecimalNull(r["TasaIncidencia"]),
                    TasaMortalidad = SafeDecimalNull(r["TasaMortalidad"])
                });

        // ═══════════════════════════════════════════════════════
        //  MAPA DE ESTADOS  →  sp_Dashboard_MapaEstados
        //  (no recibe @IdEstado — es mapa de todos los estados)
        // ═══════════════════════════════════════════════════════

        public Task<List<MapaEstadoDto>> GetMapaEstadosAsync(DashboardFiltrosDto filtros)
            => SpListAsync("dbo.sp_Dashboard_MapaEstados",
                p =>
                {
                    // El SP del mapa no recibe @IdEstado (siempre todos los estados)
                    p.Add(P("@AnioInicio", filtros.AnioInicio, SqlDbType.Int));
                    p.Add(P("@AnioFin", filtros.AnioFin, SqlDbType.Int));
                    p.Add(P("@CodigoGrupo", filtros.CodigoGrupo, SqlDbType.VarChar, 255));
                    p.Add(P("@CodigoICD", filtros.CodigoICD, SqlDbType.VarChar, 50));
                    p.Add(P("@IdSexo", filtros.IdSexo, SqlDbType.Int));
                    p.Add(P("@IdRangoEdad", filtros.IdRangoEdad, SqlDbType.Int));
                    p.Add(P("@ClaveInstitucion", filtros.ClaveInstitucion, SqlDbType.NVarChar, 50));
                    p.Add(P("@Estrato", filtros.Estrato, SqlDbType.NVarChar, 50));
                },
                r => new MapaEstadoDto
                {
                    IdEstado = SafeInt(r["idEstado"]),
                    NombreEstado = SafeStr(r["nombreEstado"]),
                    Casos = SafeLong(r["Casos"]),
                    Defunciones = SafeLong(r["Defunciones"]),
                    Poblacion = SafeLongNull(r["Poblacion"]),
                    TasaIncidencia = SafeDecimalNull(r["TasaIncidencia"]),
                    TasaMortalidad = SafeDecimalNull(r["TasaMortalidad"])
                });

        // ═══════════════════════════════════════════════════════
        //  GRÁFICA POR RANGO DE EDAD  →  sp_Dashboard_GraficaEdades
        //  (no recibe @IdRangoEdad — muestra todos los rangos)
        // ═══════════════════════════════════════════════════════

        public Task<List<GraficaEdadDto>> GetGraficaEdadesAsync(DashboardFiltrosDto filtros)
            => SpListAsync("dbo.sp_Dashboard_GraficaEdades",
                p =>
                {
                    p.Add(P("@AnioInicio", filtros.AnioInicio, SqlDbType.Int));
                    p.Add(P("@AnioFin", filtros.AnioFin, SqlDbType.Int));
                    p.Add(P("@CodigoGrupo", filtros.CodigoGrupo, SqlDbType.VarChar, 255));
                    p.Add(P("@CodigoICD", filtros.CodigoICD, SqlDbType.VarChar, 50));
                    p.Add(P("@IdEstado", filtros.IdEstado, SqlDbType.Int));
                    p.Add(P("@IdSexo", filtros.IdSexo, SqlDbType.Int));
                    p.Add(P("@ClaveInstitucion", filtros.ClaveInstitucion, SqlDbType.NVarChar, 50));
                    p.Add(P("@Estrato", filtros.Estrato, SqlDbType.NVarChar, 50));
                },
                r => new GraficaEdadDto
                {
                    IdRangoEdad = SafeInt(r["idRangoEdad"]),
                    RangoEdad = SafeStr(r["RangoEdad"]),
                    TotalCasos = SafeLong(r["TotalCasos"]),
                    TotalDefunciones = SafeLong(r["TotalDefunciones"])
                });

        // ═══════════════════════════════════════════════════════
        //  GRÁFICA POR INSTITUCIÓN  →  sp_Dashboard_GraficaInstituciones
        //  (no recibe @ClaveInstitucion)
        // ═══════════════════════════════════════════════════════

        public Task<List<GraficaInstitucionDto>> GetGraficaInstitucionesAsync(DashboardFiltrosDto filtros)
            => SpListAsync("dbo.sp_Dashboard_GraficaInstituciones",
                p =>
                {
                    p.Add(P("@AnioInicio", filtros.AnioInicio, SqlDbType.Int));
                    p.Add(P("@AnioFin", filtros.AnioFin, SqlDbType.Int));
                    p.Add(P("@CodigoGrupo", filtros.CodigoGrupo, SqlDbType.VarChar, 255));
                    p.Add(P("@CodigoICD", filtros.CodigoICD, SqlDbType.VarChar, 50));
                    p.Add(P("@IdEstado", filtros.IdEstado, SqlDbType.Int));
                    p.Add(P("@IdSexo", filtros.IdSexo, SqlDbType.Int));
                    p.Add(P("@IdRangoEdad", filtros.IdRangoEdad, SqlDbType.Int));
                    p.Add(P("@Estrato", filtros.Estrato, SqlDbType.NVarChar, 50));
                },
                r => new GraficaInstitucionDto
                {
                    ClaveInstitucion = SafeStr(r["ClaveInstitucion"]),
                    NombreInstitucion = SafeStr(r["NombreInstitucion"]),
                    TotalCasos = SafeLong(r["TotalCasos"]),
                    TotalDefunciones = SafeLong(r["TotalDefunciones"])
                });

        // ═══════════════════════════════════════════════════════
        //  GRÁFICA POR ESTRATO  →  sp_Dashboard_GraficaEstratos
        //  (no recibe @Estrato)
        // ═══════════════════════════════════════════════════════

        public Task<List<GraficaEstratoDto>> GetGraficaEstratosAsync(DashboardFiltrosDto filtros)
            => SpListAsync("dbo.sp_Dashboard_GraficaEstratos",
                p =>
                {
                    p.Add(P("@AnioInicio", filtros.AnioInicio, SqlDbType.Int));
                    p.Add(P("@AnioFin", filtros.AnioFin, SqlDbType.Int));
                    p.Add(P("@CodigoGrupo", filtros.CodigoGrupo, SqlDbType.VarChar, 255));
                    p.Add(P("@CodigoICD", filtros.CodigoICD, SqlDbType.VarChar, 50));
                    p.Add(P("@IdEstado", filtros.IdEstado, SqlDbType.Int));
                    p.Add(P("@IdSexo", filtros.IdSexo, SqlDbType.Int));
                    p.Add(P("@IdRangoEdad", filtros.IdRangoEdad, SqlDbType.Int));
                    p.Add(P("@ClaveInstitucion", filtros.ClaveInstitucion, SqlDbType.NVarChar, 50));
                },
                r => new GraficaEstratoDto
                {
                    EstratoUnidad = SafeStr(r["EstratoUnidad"]),
                    TotalCasos = SafeLong(r["TotalCasos"]),
                    TotalDefunciones = SafeLong(r["TotalDefunciones"])
                });

        // ═══════════════════════════════════════════════════════
        //  GRÁFICA DE SUBGRUPOS  →  sp_Dashboard_GraficaSubgrupos
        //  (no recibe @CodigoICD — compara subcategorías dentro del grupo)
        // ═══════════════════════════════════════════════════════

        public Task<List<GraficaSubgrupoDto>> GetGraficaSubgruposAsync(DashboardFiltrosDto filtros, int topN = 20)
            => SpListAsync("dbo.sp_Dashboard_GraficaSubgrupos",
                p =>
                {
                    p.Add(P("@AnioInicio", filtros.AnioInicio, SqlDbType.Int));
                    p.Add(P("@AnioFin", filtros.AnioFin, SqlDbType.Int));
                    p.Add(P("@CodigoGrupo", filtros.CodigoGrupo, SqlDbType.VarChar, 255));
                    p.Add(P("@IdEstado", filtros.IdEstado, SqlDbType.Int));
                    p.Add(P("@IdSexo", filtros.IdSexo, SqlDbType.Int));
                    p.Add(P("@IdRangoEdad", filtros.IdRangoEdad, SqlDbType.Int));
                    p.Add(P("@ClaveInstitucion", filtros.ClaveInstitucion, SqlDbType.NVarChar, 50));
                    p.Add(P("@Estrato", filtros.Estrato, SqlDbType.NVarChar, 50));
                    p.Add(P("@TopN", topN, SqlDbType.Int));
                },
                r => new GraficaSubgrupoDto
                {
                    CodigoICD = SafeStr(r["codigoICD"]),
                    NombreEnfermedad = SafeStr(r["nombreEnfermedad"]),
                    TotalCasos = SafeLong(r["TotalCasos"]),
                    TotalDefunciones = SafeLong(r["TotalDefunciones"])
                });

        // ═══════════════════════════════════════════════════════
        //  GRÁFICA DÍAS DE ESTANCIA  →  sp_Dashboard_GraficaDiasEstancia
        // ═══════════════════════════════════════════════════════

        public Task<List<GraficaDiasEstanciaDto>> GetGraficaDiasEstanciaAsync(DashboardFiltrosDto filtros)
            => SpListAsync("dbo.sp_Dashboard_GraficaDiasEstancia",
                p => AddFiltrosComunes(p, filtros),
                r => new GraficaDiasEstanciaDto
                {
                    IdRangoEdad = SafeInt(r["idRangoEdad"]),
                    RangoEdad = SafeStr(r["RangoEdad"]),
                    PromedioDiasEstancia = SafeDouble(r["PromedioDiasEstancia"]),
                    TotalCasos = SafeLong(r["TotalCasos"])
                });

        // ═══════════════════════════════════════════════════════
        //  TABLA PAGINADA  →  sp_Dashboard_TablaDatos
        // ═══════════════════════════════════════════════════════

        public Task<TablaDatosResponseDto> GetTablaDatosAsync(TablaDatosRequestDto request)
            => SpTablaPaginadaAsync("dbo.sp_Dashboard_TablaDatos", p =>
            {
                AddFiltrosComunes(p, request);
                p.Add(P("@Pagina", request.Pagina, SqlDbType.Int));
                p.Add(P("@RegistrosPagina", request.RegistrosPagina, SqlDbType.Int));
            });
    }
}
