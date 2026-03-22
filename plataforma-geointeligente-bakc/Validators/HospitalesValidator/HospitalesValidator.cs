using System.Globalization;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Validators.HospitalesValidator
{
  public class HospitalesValidator : IHospitalesValidator
  {
    public void ValidateCollection(IEnumerable<Hospitales> hospitales)
    {
      if (hospitales is null)
        throw new ArgumentNullException(nameof(hospitales), "La colección de hospitales no puede ser nula.");

      var cluesSet = new HashSet<string>();
      foreach (var h in hospitales)
      {
        if (string.IsNullOrWhiteSpace(h.CLUES))
          throw new InvalidOperationException("Se encontró un hospital sin CLUES.");

        if (!cluesSet.Add(h.CLUES))
          throw new InvalidOperationException($"CLUES duplicado detectado: {h.CLUES}.");

        if (!string.IsNullOrWhiteSpace(h.Latitud) && !EsNumero(h.Latitud))
          throw new InvalidOperationException($"Latitud inválida en CLUES {h.CLUES}: {h.Latitud}.");
        if (!string.IsNullOrWhiteSpace(h.Longitud) && !EsNumero(h.Longitud))
          throw new InvalidOperationException($"Longitud inválida en CLUES {h.CLUES}: {h.Longitud}.");
      }
    }

    public void ValidatePagination(int page, int pageSize)
    {
      if (page <= 0)
        throw new ArgumentOutOfRangeException(nameof(page), "El número de página debe ser mayor que cero.");
      if (pageSize <= 0 || pageSize > 500)
        throw new ArgumentOutOfRangeException(nameof(pageSize), "El tamaño de página debe estar entre 1 y 500.");
    }

    private bool EsNumero(string valor) =>
      double.TryParse(valor, NumberStyles.Float, CultureInfo.InvariantCulture, out _);
  }
}
