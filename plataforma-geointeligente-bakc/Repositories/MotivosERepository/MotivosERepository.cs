using Microsoft.EntityFrameworkCore;
using SaludPublicaBackend.Configurations.Databases;
using SaludPublicaBackend.Dtos.MotivosEDto;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Repositories.MotivosERepository
{
  public class MotivosERepository : IMotivosERepository
  {
    private readonly AppDbContext _context;

    public MotivosERepository(AppDbContext context)
    {
      _context = context;
    }

    public async Task<(IReadOnlyList<GetMotivosEDto> items, int totalCount)> GetPagedAsync(int pageNumber, int pageSize, string? search)
    {
      var query = _context.MotivoEgresos.AsNoTracking();

      if (!string.IsNullOrWhiteSpace(search))
      {
        query = query.Where(m => m.descripcion != null && m.descripcion.Contains(search));
      }

      var totalCount = await query.CountAsync();

      var items = await query
        .OrderBy(m => m.idMotivoEgreso)
        .Skip((pageNumber - 1) * pageSize)
        .Take(pageSize)
        .Select(m => new GetMotivosEDto
        {
          idMotivoEgreso = m.idMotivoEgreso,
          descripcion = m.descripcion
        })
        .ToListAsync();

      return (items, totalCount);
    }

    public async Task<MotivoEgreso?> GetByIdAsync(int idMotivoEgreso)
      => await _context.MotivoEgresos.FindAsync(idMotivoEgreso);

    public async Task<int> GetNextIdAsync()
    {
      var maxId = await _context.MotivoEgresos
        .MaxAsync(m => (int?)m.idMotivoEgreso) ?? 0;

      return maxId + 1;
    }

    public async Task<MotivoEgreso> AddAsync(MotivoEgreso entity)
    {
      // ⚠️ Aquí ya llega entity.idMotivoEgreso seteado desde el servicio
      _context.MotivoEgresos.Add(entity);
      await _context.SaveChangesAsync();
      return entity;
    }

    public async Task UpdateAsync(MotivoEgreso entity)
    {
      _context.MotivoEgresos.Update(entity);
      await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(MotivoEgreso entity)
    {
      _context.MotivoEgresos.Remove(entity);
      await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsByDescripcionAsync(string descripcion)
      => await _context.MotivoEgresos.AnyAsync(m => m.descripcion == descripcion);
  }
}
