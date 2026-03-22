using Microsoft.EntityFrameworkCore;
using SaludPublicaBackend.Configurations.Databases;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Repositories.ServicioMedicoReposiotry
{
  public class ServicioMedicoRepository : IServicioMedicoRepository
  {
    private readonly AppDbContext _context;
    public ServicioMedicoRepository(AppDbContext context) => _context = context;

    public async Task<List<ServicioMedico>> GetAllAsync()
      => await _context.ServicioMedicos
        .AsNoTracking()
        .OrderBy(s => s.nombreServicio)
        .ToListAsync();

    public async Task<ServicioMedico?> GetByIdAsync(int idServicio)
      => await _context.ServicioMedicos.FindAsync(idServicio);

    public async Task<int> GetNextIdAsync()
    {
      var maxId = await _context.ServicioMedicos
        .MaxAsync(s => (int?)s.idServicio) ?? 0;
      return maxId + 1;
    }

    public async Task<ServicioMedico> AddAsync(ServicioMedico entity)
    {
      _context.ServicioMedicos.Add(entity);
      await _context.SaveChangesAsync();
      return entity;
    }

    public async Task UpdateAsync(ServicioMedico entity)
    {
      _context.ServicioMedicos.Update(entity);
      await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(ServicioMedico entity)
    {
      _context.ServicioMedicos.Remove(entity);
      await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsByNombreAsync(string nombreServicio)
      => await _context.ServicioMedicos.AnyAsync(s => s.nombreServicio == nombreServicio);

    // ✅ Implementación con búsqueda opcional
    public async Task<(List<ServicioMedico> Items, int Total)> GetPagedAsync(int pageNumber, int pageSize, string? search)
    {
      var query = _context.ServicioMedicos.AsNoTracking();

      if (!string.IsNullOrWhiteSpace(search))
      {
        var normalized = search.Trim().ToUpper();
        query = query.Where(s =>
          s.nombreServicio != null && s.nombreServicio.ToUpper().Contains(normalized) ||
          s.descripcion    != null && s.descripcion.Contains(search));
      }

      var total = await query.CountAsync();

      var items = await query
        .OrderBy(s => s.nombreServicio)
        .Skip((pageNumber - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();

      return (items, total);
    }
  }
}
