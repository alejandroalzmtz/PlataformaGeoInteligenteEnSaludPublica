using System.Collections.Generic;
using System.Threading.Tasks;
using SaludPublicaBackend.Dtos.RangoEdadDto;

namespace SaludPublicaBackend.Services.RangoEdadService
{
  public interface IRangoEdadService
  {
    Task<IEnumerable<GetRangoEdadDto>> GetRangosEdad();
    Task<GetRangoEdadDto> RegisterRangoEdad(RegisterRangoEdadDto dto);
  }
}
