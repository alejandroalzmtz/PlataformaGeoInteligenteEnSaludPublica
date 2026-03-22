using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.Generic;

namespace SaludPublicaBackend.Repositories.ActividadUsuarioRepository
{
  public interface IActividadUsuarioRepository : IGenericRepository<ActividadUsuario>
  {
    Task<List<ActividadUsuario>> GetByUsuarioAsync(int idUsuario);
    Task<List<ActividadUsuario>> GetByFechaActividadAsync(DateOnly fecha);
  }
}