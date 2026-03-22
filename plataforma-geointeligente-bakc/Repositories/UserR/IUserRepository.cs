using System.Threading.Tasks;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.Generic;

namespace SaludPublicaBackend.Repositories.UserR
{
  public interface IUserRepository : IGenericRepository<Usuario>
  { 
    Task<bool> ExistsByNombreUsuarioAsync(string nombreUsuario);
    Task<Usuario?> GetByNombreUsuarioAsync(string nombreUsuario);
    }
}