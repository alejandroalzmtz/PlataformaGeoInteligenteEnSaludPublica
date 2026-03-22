using System.Collections.Generic;
using SaludPublicaBackend.Configurations.CustomHttpResponses;
using SaludPublicaBackend.Dtos.RangoEdadDto;
using SaludPublicaBackend.Utils.Validations;

namespace SaludPublicaBackend.Validators.RangoEdadValidator
{
  public class RangoEdadValidator : IRangoEdadValidator
  {
    public bool IsRangoEdadListValid(IEnumerable<GetRangoEdadDto>? rangosEdad)
    {
      if (!rangosEdad.IsDifferentToNull())
        throw new NoContentException("No se encontraron rangos de edad.");

      return true;
    }
  }
}
