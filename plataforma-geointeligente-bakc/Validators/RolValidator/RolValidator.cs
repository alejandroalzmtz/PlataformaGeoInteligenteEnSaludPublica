using System.Collections.Generic;
using SaludPublicaBackend.Configurations.CustomHttpResponses;
using SaludPublicaBackend.Dtos.RolDto;
using SaludPublicaBackend.Utils.Validations;

namespace SaludPublicaBackend.Validators.RolValidator
{
  public class RolValidator : IRolValidator
  {
    public bool IsRolListValid(IEnumerable<GetRolDto>? roles)
    {
      if (!roles.IsDifferentToNull())
        throw new NoContentException("No se encontraron roles.");

      return true;
    }
  }
}
