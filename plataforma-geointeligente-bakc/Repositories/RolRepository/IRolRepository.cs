using System.Threading.Tasks;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.Generic;

namespace SaludPublicaBackend.Repositories.RolRepository
{
  public interface IRolRepository : IGenericRepository<Rol>
  {
    Task<bool> ExistsByNombreRolAsync(string nombreRol);
    Task<Rol?> GetByNombreRolAsync(string nombreRol);
  }
}
