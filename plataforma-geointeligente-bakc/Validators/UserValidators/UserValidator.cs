using System.Collections.Generic;
using SaludPublicaBackend.Configurations.CustomHttpResponses;
using SaludPublicaBackend.Dtos.User;
using SaludPublicaBackend.Utils.Validations;

namespace SaludPublicaBackend.Validators.UserValidators
{
  public class UserValidator : IUserValidator
  {
    public bool IsUserListValid(IEnumerable<GetUserDto>? users)
    {
      if (!users.IsDifferentToNull())
        throw new NoContentException("No se encontraron usuarios.");

      return true;
    }
  }
}