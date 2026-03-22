using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Validators.EstadoValidator
{
  public interface IEstadoValidator
  {
    void ValidateList(IEnumerable<Estado> estados);
  }
}
