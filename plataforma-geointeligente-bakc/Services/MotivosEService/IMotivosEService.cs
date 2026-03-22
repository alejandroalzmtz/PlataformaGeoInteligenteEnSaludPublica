using SaludPublicaBackend.Dtos.MotivosEDto;

namespace SaludPublicaBackend.Services.MotivosEService
{
  public interface IMotivosEService
  {
    Task<PagedMotivosEDto> GetPagedAsync(int pageNumber, int pageSize, string? search);
    Task<GetMotivosEDto?> GetByIdAsync(int idMotivoEgreso);
    Task<GetMotivosEDto> RegisterAsync(RegisterMotivosEDto dto);
    Task<GetMotivosEDto?> UpdateAsync(int idMotivoEgreso, UpdateMotivosEDto dto);
    Task<bool> DeleteAsync(int idMotivoEgreso);
  }
}
