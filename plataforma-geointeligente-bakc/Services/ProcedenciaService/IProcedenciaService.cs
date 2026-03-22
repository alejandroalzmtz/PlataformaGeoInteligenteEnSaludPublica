using SaludPublicaBackend.Dtos.ProcedenciaDto;

namespace SaludPublicaBackend.Services.ProcedenciaService
{
  public interface IProcedenciaService
  {
    Task<IEnumerable<GetProcedenciaDto>> GetProcedenciasAsync();
    Task<GetProcedenciaDto?> GetByIdAsync(int idProcedencia);
    Task<GetProcedenciaDto> RegisterAsync(RegisterProcedenciaDto dto);
    Task<GetProcedenciaDto?> UpdateAsync(int idProcedencia, UpdateProcedenciaDto dto);
    Task<bool> DeleteAsync(int idProcedencia);
  }
}
