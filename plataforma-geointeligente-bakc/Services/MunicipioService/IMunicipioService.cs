using SaludPublicaBackend.Dtos.MunicipioDto;

namespace SaludPublicaBackend.Services.MunicipioService
{
  public interface IMunicipioService
  {
    Task<PagedMunicipioDto> GetMunicipiosPagedAsync(int pageNumber, int pageSize, int idEstado, string? search);
    Task<GetMunicipioDto?> GetByIdAsync(int idMunicipio);
    Task<GetMunicipioDto> RegisterAsync(RegisterMunicipioDto dto);
    Task<GetMunicipioDto?> UpdateAsync(int idMunicipio, UpdateMunicipioDto dto);
    Task<bool> DeleteAsync(int idMunicipio);
    Task<bool> DesactivarAsync(int idMunicipio);
  }
}
