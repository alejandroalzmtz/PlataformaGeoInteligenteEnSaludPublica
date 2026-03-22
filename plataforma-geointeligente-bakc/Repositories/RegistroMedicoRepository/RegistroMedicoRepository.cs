using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using SaludPublicaBackend.Configurations.Databases;
using SaludPublicaBackend.Dtos.RegistroMedicoDto;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.Generic;

namespace SaludPublicaBackend.Repositories.RegistroMedicoRepository
{
  public class RegistroMedicoRepository : GenericRepository<RegistroMedico>, IRegistroMedicoRepository
  {
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public RegistroMedicoRepository(AppDbContext context, IMapper mapper) : base(context, mapper)
    {
      _context = context;
      _mapper = mapper;
    }

    // ---- BÚSQUEDAS BASE ----------------------------------------------------

    public async Task<List<RegistroMedico>> GetByEstadoAsync(int idEstado)
    {
      return await _context.RegistroMedicos
        .AsNoTracking()
        .Where(r => r.idEstado == idEstado)
        .ToListAsync();
    }

    public async Task<List<RegistroMedico>> GetByRangoFechasAsync(DateTime desde, DateTime hasta)
    {
      return await _context.RegistroMedicos
        .AsNoTracking()
        .Where(r => r.fechaIngreso >= desde && r.fechaIngreso <= hasta)
        .ToListAsync();
    }

    public async Task<List<RegistroMedico>> GetByEnfermedadAsync(string idEnfermedad)
    {
      return await _context.RegistroMedicos
        .AsNoTracking()
        .Where(r => r.idEnfermedad == idEnfermedad)
        .ToListAsync();
    }

    // ---- DES/HABILITADOS Y RANGO DE IDs ------------------------------------

    // Solo deshabilitados
    public async Task<List<RegistroMedico>> GetDeshabilitadosAsync()
    {
      return await _context.RegistroMedicos
        .AsNoTracking()
        .Where(r => r.Habilitado == false)
        .ToListAsync();
    }

    // Rango por idRegistro; por default, solo habilitados
    public async Task<List<RegistroMedico>> GetByIdRangeAsync(int startId, int endId, bool soloHabilitados = true)
    {
      var query = _context.RegistroMedicos.AsNoTracking();

      if (soloHabilitados)
        query = query.Where(r => r.Habilitado == true);

      return await query
        .Where(r => r.idRegistro >= startId && r.idRegistro <= endId)
        .OrderBy(r => r.idRegistro)
        .ToListAsync();
    }

    // ---- PAGINADO -----------------------------------------------------------

    public async Task<(List<RegistroMedico> Items, int Total)> GetPagedAsync(int page, int pageSize)
    {
      var query = _context.RegistroMedicos
        .AsNoTracking()
        .Where(r => r.Habilitado) // Sólo habilitados para la paginación pública
        .OrderBy(r => r.idRegistro);

      var total = await query.CountAsync();
      var skip = (page - 1) * pageSize;

      var items = await query
        .Skip(skip)
        .Take(pageSize)
        .ToListAsync();

      return (items, total);
    }

    // ---- DETALLE POR IDS (para la tabla C50) --------------------------------

    public async Task<List<GetRegistroMedicoDto>> GetByIdsAsync(IList<int> ids)
    {
      if (ids == null || ids.Count == 0)
        return new List<GetRegistroMedicoDto>();

      return await _context.RegistroMedicos
        .AsNoTracking()
        .Where(r => ids.Contains(r.idRegistro))
        .OrderBy(r => r.idRegistro)
        .ProjectTo<GetRegistroMedicoDto>(_mapper.ConfigurationProvider)
        .ToListAsync();
    }

    // ---- HELPERS DE FECHA / CONSULTAS POR AÑO -------------------------------

    // Mantén este helper si ya lo tienes más abajo; si no, déjalo aquí:
    private static string BuildFechaDateExpr(string by)
    {
      var col = (by ?? "egreso").Trim().ToLowerInvariant() == "ingreso" ? "fechaIngreso" : "fechaEgreso";
      return $"COALESCE(TRY_CONVERT(date, t.{col}, 126), TRY_CONVERT(date, t.{col}, 23), TRY_CONVERT(date, t.{col}, 103), TRY_CONVERT(date, t.{col}, 101))";
    }

    // IDs por año + filtro opcional por diagnóstico; respeta Habilitado=1
    public async Task<List<int>> GetIdsByYearAsync(
      int year, int? startId, int? endId, string by = "egreso", string? enfermedadCode = null)
    {
      var desde = new DateTime(year, 1, 1).Date;
      var hasta = new DateTime(year + 1, 1, 1).AddDays(-1).Date;
      var fechaExpr = BuildFechaDateExpr(by);

      var sql = $@"
SELECT t.idRegistro
FROM [dbo].[RegistroMedico] AS t
WHERE {fechaExpr} BETWEEN @p0 AND @p1
  AND t.Habilitado = 1";

      var parameters = new List<object> { desde, hasta };

      if (startId.HasValue && endId.HasValue)
      {
        sql += " AND t.idRegistro BETWEEN @p2 AND @p3";
        parameters.Add(startId.Value);
        parameters.Add(endId.Value);
      }

      if (!string.IsNullOrWhiteSpace(enfermedadCode))
      {
        sql += $" AND UPPER(t.idEnfermedad) LIKE UPPER(@p{parameters.Count}) + '%'";
        parameters.Add(enfermedadCode);
      }

      sql += " ORDER BY t.idRegistro";

      return await _context.Database.SqlQueryRaw<int>(sql, parameters.ToArray()).ToListAsync();
    }

    public async Task<List<int>> GetDistinctYearsAsync(string by = "egreso")
    {
      var fechaExpr = BuildFechaDateExpr(by);
      var sql = $@"
SELECT DISTINCT YEAR({fechaExpr}) AS [Year]
FROM [dbo].[RegistroMedico] AS t
WHERE {fechaExpr} IS NOT NULL AND t.Habilitado = 1
ORDER BY [Year]";
      return await _context.Database.SqlQueryRaw<int>(sql).ToListAsync();
    }

    public async Task<(int? StartId, int? EndId, int Count)> GetIdRangeByYearAsync(int year, string by = "egreso")
    {
      var desde = new DateTime(year, 1, 1).Date;
      var hasta = new DateTime(year + 1, 1, 1).AddDays(-1).Date;
      var fechaExpr = BuildFechaDateExpr(by);

      var sql = $@"
SELECT
  MIN(t.idRegistro) AS StartId,
  MAX(t.idRegistro) AS EndId,
  COUNT(*)          AS [Count]
FROM [dbo].[RegistroMedico] AS t
WHERE {fechaExpr} BETWEEN @p0 AND @p1 AND t.Habilitado = 1";

      var row = await _context.Database.SqlQueryRaw<IdRangeRow>(sql, desde, hasta).FirstOrDefaultAsync();
      return row is null ? (null, null, 0) : (row.StartId, row.EndId, row.Count);
    }

    public async Task<List<(int Year, int? StartId, int? EndId, int Count)>> GetYearsSummaryAsync(
      int? minYear = null, int? maxYear = null, string by = "egreso")
    {
      var filters = new List<string> { "X.Fecha IS NOT NULL" };
      var parameters = new List<object>();

      if (minYear.HasValue)
      {
        var minDate = new DateTime(minYear.Value, 1, 1).Date;
        filters.Add($"X.Fecha >= @p{parameters.Count}");
        parameters.Add(minDate);
      }
      if (maxYear.HasValue)
      {
        var maxDate = new DateTime(maxYear.Value + 1, 1, 1).AddDays(-1).Date;
        filters.Add($"X.Fecha <= @p{parameters.Count}");
        parameters.Add(maxDate);
      }

      var where = "WHERE " + string.Join(" AND ", filters);
      var fechaExpr = BuildFechaDateExpr(by);

      var sql = $@"
WITH X AS (
  SELECT
    t.idRegistro,
    {fechaExpr} AS Fecha
  FROM [dbo].[RegistroMedico] AS t
  WHERE t.Habilitado = 1
)
SELECT
  YEAR(X.Fecha) AS [Year],
  MIN(X.idRegistro) AS StartId,
  MAX(X.idRegistro) AS EndId,
  COUNT(*) AS [Count]
FROM X
{where}
GROUP BY YEAR(X.Fecha)
ORDER BY [Year]";

      var rows = await _context.Database.SqlQueryRaw<YearSummaryRow>(sql, parameters.ToArray()).ToListAsync();
      return rows.Select(r => (r.Year, r.StartId, r.EndId, r.Count)).ToList();
    }

    public async Task<(List<RegistroMedico> Items, int Total, int Filtered)> SearchPagedAsync(string? query, int page, int pageSize)
    {
      var baseQuery = _context.RegistroMedicos
          .AsNoTracking()
          .Where(r => r.Habilitado); // toda la tabla habilitada

      var total = await baseQuery.CountAsync();

      if (string.IsNullOrWhiteSpace(query))
      {
        var itemsNoFilter = await baseQuery
          .OrderBy(r => r.idRegistro)
          .Skip((page - 1) * pageSize)
          .Take(pageSize)
          .ToListAsync();

        return (itemsNoFilter, total, total);
      }

      query = query.Trim();
      bool isInt = int.TryParse(query, out var intVal);

      // Ajusta los campos según lo que realmente quieras permitir
      var filteredQuery = baseQuery.Where(r =>
          (isInt && (
              r.idRegistro == intVal ||
              r.idEstado == intVal ||
              r.idMunicipio == intVal ||
              r.idLoc == intVal ||
              r.edad == intVal
          ))
          ||
          (!isInt && (
              (r.idEnfermedad != null && EF.Functions.Like(r.idEnfermedad, "%" + query + "%"))
          ))
      );

      var filtered = await filteredQuery.CountAsync();

      var items = await filteredQuery
          .OrderBy(r => r.idRegistro)
          .Skip((page - 1) * pageSize)
          .Take(pageSize)
          .ToListAsync();

      return (items, total, filtered);
    }

    private sealed class IdRangeRow { public int? StartId { get; set; } public int? EndId { get; set; } public int Count { get; set; } }
    private sealed class YearSummaryRow { public int Year { get; set; } public int? StartId { get; set; } public int? EndId { get; set; } public int Count { get; set; } }
  }
}
