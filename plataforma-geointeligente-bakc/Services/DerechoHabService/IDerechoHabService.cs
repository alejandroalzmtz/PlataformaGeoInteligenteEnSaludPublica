using SaludPublicaBackend.Dtos.DerechoHabDto;

namespace SaludPublicaBackend.Services.DerechoHabService
{
  public interface IDerechoHabService
  {
    Task<PagedDerechoHabDto> GetPagedAsync(int pageNumber, int pageSize, string? search);
    Task<GetDerechoHabDto?> GetByIdAsync(int idDerechoHab);
    Task<GetDerechoHabDto> RegisterAsync(RegisterDerechoHabDto dto);
    Task<GetDerechoHabDto?> UpdateAsync(int idDerechoHab, UpdateDerechoHabDto dto);
    Task<bool> DeleteAsync(int idDerechoHab);
  }
}
