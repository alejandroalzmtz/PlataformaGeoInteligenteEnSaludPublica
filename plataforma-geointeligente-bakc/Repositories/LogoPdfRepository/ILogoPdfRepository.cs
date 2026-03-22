using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.Generic;

namespace SaludPublicaBackend.Repositories.LogoPdfRepository
{
  public interface ILogoPdfRepository : IGenericRepository<LogoPdf>
  {
    Task<LogoPdf?> GetActivoAsync();
    Task DesactivarTodosAsync();
    Task DeleteAllAsync();
  }
}
