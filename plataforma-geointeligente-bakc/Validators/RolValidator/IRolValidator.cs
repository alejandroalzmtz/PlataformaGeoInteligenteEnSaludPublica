using System.Collections.Generic;
using SaludPublicaBackend.Dtos.RolDto;

namespace SaludPublicaBackend.Validators.RolValidator
{
  public interface IRolValidator
  {
    bool IsRolListValid(IEnumerable<GetRolDto>? roles);
  }
}
