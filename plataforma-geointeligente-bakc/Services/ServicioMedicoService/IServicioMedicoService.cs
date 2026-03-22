using SaludPublicaBackend.Dtos.ServicioMedicoDto;

namespace SaludPublicaBackend.Services.ServicioMedicoService
{
  public interface IServicioMedicoService
  {
    Task<PagedServicioMedicoDto> GetServiciosAsync(int pageNumber, int pageSize, string? search);
    Task<GetServicioMedicoDto?> GetByIdAsync(int idServicio);
    Task<GetServicioMedicoDto> RegisterAsync(RegisterServicioMedicoDto dto);
    Task<GetServicioMedicoDto?> UpdateAsync(int idServicio, UpdateServicioMedicoDto dto);
    Task<bool> DeleteAsync(int idServicio);
  }
}
