using System.Collections.Generic;
using SaludPublicaBackend.Dtos.RangoEdadDto;

namespace SaludPublicaBackend.Validators.RangoEdadValidator
{
  public interface IRangoEdadValidator
  {
    bool IsRangoEdadListValid(IEnumerable<GetRangoEdadDto>? rangosEdad);
  }
}
