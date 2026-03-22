using SaludPublicaBackend.Dtos.ActividadUsuarioDto;

namespace SaludPublicaBackend.Services.ActividadUsuarioService
{
  public interface IActividadUsuarioService
  {
    Task<IEnumerable<GetActividadUsuarioDto>> GetActividades();
    Task<GetActividadUsuarioDto> RegisterActividad(RegisterActividadUsuarioDto dto);
    Task<IEnumerable<GetActividadUsuarioDto>> GetActividadesPorUsuario(int idUsuario);
    }
}