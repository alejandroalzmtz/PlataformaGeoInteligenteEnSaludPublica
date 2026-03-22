using SaludPublicaBackend.Dtos.EstadosDto;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Repositories.EstadoRepository
{
  public interface IEstadoRepository
  {
    Task<List<Estado>> GetAllAsync();
    Task<(IReadOnlyList<GetEstadosDto> items, int totalCount)> GetPagedAsync(int pageNumber, int pageSize, string? search);
    Task<Estado> AddAsync(Estado estado);
    Task<Estado?> GetByIdAsync(int id);
    Task UpdateAsync(Estado estado);
    Task DeleteAsync(Estado estado);
    Task<bool> ExistsByNombreAsync(string nombreEstado);
    Task<Estado?> GetByNombreAsync(string nombreEstado);
    Task<int> GetNextIdAsync();
  }
}
