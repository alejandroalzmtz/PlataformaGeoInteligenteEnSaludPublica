using System.Collections.Generic;
using System.Threading.Tasks;
using SaludPublicaBackend.Dtos.User;

namespace SaludPublicaBackend.Services.UserService
{
  public interface IUserService
  {
    Task<IEnumerable<GetUserDto>> GetUsers();
  }
}