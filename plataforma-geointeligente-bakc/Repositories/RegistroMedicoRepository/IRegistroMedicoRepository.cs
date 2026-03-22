using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SaludPublicaBackend.Dtos.RegistroMedicoDto;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.Generic;

namespace SaludPublicaBackend.Repositories.RegistroMedicoRepository
{
  public interface IRegistroMedicoRepository : IGenericRepository<RegistroMedico>
  {
    // Búsquedas base
    Task<List<RegistroMedico>> GetByEstadoAsync(int idEstado);
    Task<List<RegistroMedico>> GetByRangoFechasAsync(DateTime desde, DateTime hasta);
    Task<List<RegistroMedico>> GetByEnfermedadAsync(string idEnfermedad);

  // Paginado
  Task<(List<RegistroMedico> Items, int Total)> GetPagedAsync(int page, int pageSize);

  // develop: vistas de habilitados/deshabilitados y por rango
  Task<List<RegistroMedico>> GetDeshabilitadosAsync();
    Task<List<RegistroMedico>> GetByIdRangeAsync(int startId, int endId, bool soloHabilitados = true);

    // tuyo: traer DTOs por lista de IDs (para la tabla filtrada)
    Task<List<GetRegistroMedicoDto>> GetByIdsAsync(IList<int> ids);

    // Años / rangos por año (con columna seleccionable y filtro opcional por diagnóstico)
    Task<List<int>> GetIdsByYearAsync(int year, int? startId, int? endId, string by = "egreso", string? enfermedadCode = null);
    Task<List<int>> GetDistinctYearsAsync(string by = "egreso");
    Task<(int? StartId, int? EndId, int Count)> GetIdRangeByYearAsync(int year, string by = "egreso");

    // Resumen por año (min/max/count)
    Task<List<(int Year, int? StartId, int? EndId, int Count)>> GetYearsSummaryAsync(
      int? minYear = null, int? maxYear = null, string by = "egreso");

    Task<(List<RegistroMedico> Items, int Total, int Filtered)> SearchPagedAsync(string? query, int page, int pageSize);
  }
}
