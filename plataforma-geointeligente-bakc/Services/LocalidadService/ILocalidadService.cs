using SaludPublicaBackend.Dtos.LocalidadDto;
using System.Threading.Tasks;

namespace SaludPublicaBackend.Services.LocalidadService
{
  public interface ILocalidadService
  {
    Task<PagedLocalidadDto> GetLocalidadesPagedAsync(int pageNumber, int pageSize, int idEdo, int idMpo, string? search);
    Task<GetLocalidadDto?> GetByIdAsync(int idLoc);
    Task<GetLocalidadDto> RegisterAsync(RegisterLocalidadDto dto);
    Task<GetLocalidadDto?> UpdateAsync(int idLoc, UpdateLocalidadDto dto);
    Task<bool> DeleteAsync(int idLoc);
    Task<bool> DesactivarAsync(int idLoc);
  }
}
