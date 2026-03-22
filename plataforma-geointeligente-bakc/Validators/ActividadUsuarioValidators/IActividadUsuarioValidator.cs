using SaludPublicaBackend.Dtos.ActividadUsuarioDto;

namespace SaludPublicaBackend.Validators.ActividadUsuarioValidators
{
  public interface IActividadUsuarioValidator
  {
    bool IsActividadListValid(IEnumerable<GetActividadUsuarioDto>? actividades);
  }
}