using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Repositories.ServicioMedicoReposiotry
{
  public interface IServicioMedicoRepository
  {
    Task<List<ServicioMedico>> GetAllAsync();
    Task<ServicioMedico?> GetByIdAsync(int idServicio);
    Task<int> GetNextIdAsync();
    Task<ServicioMedico> AddAsync(ServicioMedico entity);
    Task UpdateAsync(ServicioMedico entity);
    Task DeleteAsync(ServicioMedico entity);
    Task<bool> ExistsByNombreAsync(string nombreServicio);

    // Paginación con búsqueda opcional
    Task<(List<ServicioMedico> Items, int Total)> GetPagedAsync(int pageNumber, int pageSize, string? search);
  }
}
