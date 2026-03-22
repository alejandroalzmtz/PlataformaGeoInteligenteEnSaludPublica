using SaludPublicaBackend.Dtos.RegistroMedicoDto;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SaludPublicaBackend.Services.RegistroMedicoService
{
  public interface IRegistroMedicoService
  {
    // CRUD base
    Task<IEnumerable<GetRegistroMedicoDto>> GetRegistros();
    Task<GetRegistroMedicoDto> RegisterRegistro(RegisterRegistroMedicoDto dto);
    Task<GetRegistroMedicoDto> UpdateRegistro(int id, RegisterRegistroMedicoDto dto);
    Task DeleteRegistro(int id);
    Task RevertirEliminacion(int id);

    Task<(int Updated, List<int> NotFound)> RevertirEliminacionMasivo(IList<int> ids);
    Task<(int Deleted, List<int> NotFound)> DeleteRegistroMasivo(IList<int> ids);
    Task<int> CleanExpiredAsync();


        // develop
        Task<IEnumerable<GetRegistroMedicoDto>> GetRegistrosDeshabilitados();
    Task<IEnumerable<GetRegistroMedicoDto>> GetRegistrosByRange(int startId, int endId);

    // Obtener registros por lista de IDs (para casos no contiguos como filtro C50)
    Task<IEnumerable<GetRegistroMedicoDto>> GetByIdsAsync(IList<int> ids);

    // Admite filtro opcional por diagnóstico (p. ej. C50)
    Task<GetRegistroMedicoYear> GetRegistrosYearAsync(
      int year, int? startId, int? endId, string? enfermedadCode = null
    );

    // Selección de columna base: egreso (default) o ingreso
    Task<IEnumerable<GetRegistroMedicoYear>> GetRegistrosYearsAsync(
      bool includeIds = false, string by = "egreso"
    );

    // NUEVO: Paginación
    Task<PagedRegistroDto> GetPagedAsync(int page, int pageSize);
    Task<PagedRegistroDto> SearchAsync(string? query, int page, int pageSize);


    }
}
