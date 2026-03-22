using Microsoft.EntityFrameworkCore;
using SaludPublicaBackend.Configurations.Databases;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Repositories.ProcedenciaRepository
{
  public class ProcedenciaRepository : IProcedenciaRepository
  {
    private readonly AppDbContext _context;
    public ProcedenciaRepository(AppDbContext context) => _context = context;

    public async Task<List<Procedencia>> GetAllAsync()
      => await _context.Procedencias
        .AsNoTracking()
        .OrderBy(p => p.idProcedencia)
        .ToListAsync();

    public async Task<Procedencia?> GetByIdAsync(int idProcedencia)
      => await _context.Procedencias.FindAsync(idProcedencia);

    public async Task<int> GetNextIdAsync()
    {
      var maxId = await _context.Procedencias
        .MaxAsync(p => (int?)p.idProcedencia) ?? 0;
      return maxId + 1;
    }

    public async Task<Procedencia> AddAsync(Procedencia procedencia)
    {
      _context.Procedencias.Add(procedencia);
      await _context.SaveChangesAsync();
      return procedencia;
    }

    public async Task UpdateAsync(Procedencia procedencia)
    {
      _context.Procedencias.Update(procedencia);
      await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Procedencia procedencia)
    {
      _context.Procedencias.Remove(procedencia);
      await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsByDescripcionAsync(string descripcion)
      => await _context.Procedencias.AnyAsync(p => p.descripcion == descripcion);
  }
}
