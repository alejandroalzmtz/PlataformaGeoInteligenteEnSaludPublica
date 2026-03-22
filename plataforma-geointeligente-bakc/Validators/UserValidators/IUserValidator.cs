using System.Collections.Generic;
using SaludPublicaBackend.Dtos.User;

namespace SaludPublicaBackend.Validators.UserValidators
{
  public interface IUserValidator
  {
    bool IsUserListValid(IEnumerable<GetUserDto>? users);
  }
}