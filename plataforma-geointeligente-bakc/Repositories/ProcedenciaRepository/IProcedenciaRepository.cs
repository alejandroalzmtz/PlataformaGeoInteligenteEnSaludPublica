using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Repositories.ProcedenciaRepository
{
  public interface IProcedenciaRepository
  {
    Task<List<Procedencia>> GetAllAsync();
    Task<Procedencia?> GetByIdAsync(int idProcedencia);
    Task<int> GetNextIdAsync();                 // ← agregar
    Task<Procedencia> AddAsync(Procedencia procedencia);
    Task UpdateAsync(Procedencia procedencia);
    Task DeleteAsync(Procedencia procedencia);
    Task<bool> ExistsByDescripcionAsync(string descripcion);
  }
}
