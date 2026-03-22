using SaludPublicaBackend.Dtos.PanelDto;

namespace SaludPublicaBackend.Services.PanelService
{
  public interface IPanelService
  {
    Task<IEnumerable<GetPanelDto>> GetAllAsync();
    Task<GetPanelDto> GetByIdAsync(int id);
    Task<GetPanelDto> CreateAsync(CreatePanelDto dto);
    Task<GetPanelDto> UpdateAsync(UpdatePanelDto dto);
    Task DeleteAsync(int id);
  }
}
