using SaludPublicaBackend.Dtos.LogoPdfDto;

namespace SaludPublicaBackend.Services.LogoPdfService
{
  public interface ILogoPdfService
  {
    Task<IEnumerable<GetLogoPdfDto>> GetAllAsync();
    Task<GetLogoPdfDto> GetByIdAsync(int id);
    Task<GetLogoPdfDto> GetActivoAsync();
    Task<(byte[] ImagenData, string Formato)> GetImagenAsync(int id);
    Task<(byte[] ImagenData, string Formato)> GetImagenActivoAsync();
    Task<(string DataUrl, string Formato)> GetActivoDataUrlAsync();
    Task<GetLogoPdfDto> CreateAsync(IFormFile imagen);
    Task<GetLogoPdfDto> UpdateAsync(int id, IFormFile imagen);
    Task<GetLogoPdfDto> SetActivoAsync(int id);
    Task DeleteAsync(int id);
    Task DeleteAllAsync();
  }
}
