using System.Collections.Generic;
using System.Threading.Tasks;
using SaludPublicaBackend.Dtos.RolDto;

namespace SaludPublicaBackend.Services.RolService
{
  public interface IRolService
  {
    Task<IEnumerable<GetRolDto>> GetRoles();
  }
}
