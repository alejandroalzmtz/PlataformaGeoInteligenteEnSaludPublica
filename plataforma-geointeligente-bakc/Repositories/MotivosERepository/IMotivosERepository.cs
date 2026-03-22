using SaludPublicaBackend.Dtos.MotivosEDto;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Repositories.MotivosERepository
{
  public interface IMotivosERepository
  {
    Task<(IReadOnlyList<GetMotivosEDto> items, int totalCount)> GetPagedAsync(int pageNumber, int pageSize, string? search);
    Task<MotivoEgreso?> GetByIdAsync(int idMotivoEgreso);
    Task<int> GetNextIdAsync();                // ← agregar
    Task<MotivoEgreso> AddAsync(MotivoEgreso entity);
    Task UpdateAsync(MotivoEgreso entity);
    Task DeleteAsync(MotivoEgreso entity);
    Task<bool> ExistsByDescripcionAsync(string descripcion);
  }
}
