using SaludPublicaBackend.Dtos.EstadosDto;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SaludPublicaBackend.Services.EstadoService
{
  public interface IEstadoService
  {
    Task<IEnumerable<GetEstadosDto>> GetEstadosAsync();
    Task<PagedEstadosDto> GetEstadosPagedAsync(int pageNumber, int pageSize, string? search);
    Task<GetEstadosDto?> GetEstadoByIdAsync(int id);
    Task<GetEstadosDto> RegisterEstadoAsync(RegisterEstadoDto dto);
    Task<GetEstadosDto?> UpdateEstadoAsync(int id, UpdateEstadoDto dto);
    Task<bool> DeleteEstadoAsync(int id);
    Task<bool> DesactivarEstadoAsync(int id);
  }
}
