using SaludPublicaBackend.Dtos.DerechoHabDto;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Repositories.DerechoHabRepository
{
  public interface IDerechoHabRepository
  {
    Task<(IReadOnlyList<GetDerechoHabDto> items, int totalCount)> GetPagedAsync(int pageNumber, int pageSize, string? search);
    Task<DerechoHabitacion?> GetByIdAsync(int idDerechoHab);
    Task<DerechoHabitacion> AddAsync(DerechoHabitacion entity);
    Task UpdateAsync(DerechoHabitacion entity);
    Task DeleteAsync(DerechoHabitacion entity);
    Task<bool> ExistsByDescripcionAsync(string descripcion);
  }
}
