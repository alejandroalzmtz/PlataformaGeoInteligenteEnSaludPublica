using SaludPublicaBackend.Dtos.NoticiaDto;

namespace SaludPublicaBackend.Services.NoticiaService
{
  public interface INoticiaService
  {
    Task<IEnumerable<GetNoticiaDto>> GetAllAsync();
    Task<GetNoticiaDto> GetByIdAsync(int id);
    Task<GetNoticiaDto> CreateAsync(CreateNoticiaDto dto);
    Task<GetNoticiaDto> UpdateAsync(UpdateNoticiaDto dto);
    Task DeleteAsync(int id);
  }
}