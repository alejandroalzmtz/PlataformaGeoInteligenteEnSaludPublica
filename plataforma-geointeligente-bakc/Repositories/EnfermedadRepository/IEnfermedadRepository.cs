using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.Generic;

namespace SaludPublicaBackend.Repositories.EnfermedadRepository
{
  public interface IEnfermedadRepository : IGenericRepository<Enfermedad>
  {
    Task<bool> ExistsByCodigoICDAsync(string codigoICD);
    Task<Enfermedad?> GetByCodigoICDAsync(string codigoICD);
  }
}
