using System.Threading.Tasks;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.Generic;

namespace SaludPublicaBackend.Repositories.RangoEdadRepository
{
  public interface IRangoEdadRepository : IGenericRepository<RangoEdad>
  {
    Task<bool> ExistsByNombreRangoEdadAsync(int rangoInicial, int rangoFinal);
    Task<RangoEdad?> GetByNombreRangoEdadAsync(int rangoInicial, int rangoFinal);
  }
}
