using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Validators.EstadoValidator
{
  public class EstadoValidator : IEstadoValidator
  {
    public void ValidateList(IEnumerable<Estado> estados)
    {
      if (estados is null) throw new ArgumentNullException(nameof(estados));
      var ids = new HashSet<int>();
      foreach (var e in estados)
      {
        if (!ids.Add(e.idEstado))
          throw new InvalidOperationException($"Id Estado duplicado: {e.idEstado}");
      }
    }
  }
}
