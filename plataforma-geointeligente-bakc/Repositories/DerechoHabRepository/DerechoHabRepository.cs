using Microsoft.EntityFrameworkCore;
using SaludPublicaBackend.Configurations.Databases;
using SaludPublicaBackend.Dtos.DerechoHabDto;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Repositories.DerechoHabRepository
{
  public class DerechoHabRepository : IDerechoHabRepository
  {
    private readonly AppDbContext _context;

    public DerechoHabRepository(AppDbContext context)
    {
      _context = context;
    }

    public async Task<(IReadOnlyList<GetDerechoHabDto> items, int totalCount)> GetPagedAsync(int pageNumber, int pageSize, string? search)
    {
      var query = _context.DerechosHabitaciones.AsNoTracking();

      if (!string.IsNullOrWhiteSpace(search))
      {
        query = query.Where(d => d.descripcion != null && d.descripcion.Contains(search));
      }

      var totalCount = await query.CountAsync();

      var items = await query
        .OrderBy(d => d.idDerechoHab)
        .Skip((pageNumber - 1) * pageSize)
        .Take(pageSize)
        .Select(d => new GetDerechoHabDto
        {
          idDerechoHab = d.idDerechoHab,
          descripcion = d.descripcion
        })
        .ToListAsync();

      return (items, totalCount);
    }

    public async Task<DerechoHabitacion?> GetByIdAsync(int idDerechoHab)
      => await _context.DerechosHabitaciones.FindAsync(idDerechoHab);

    public async Task<DerechoHabitacion> AddAsync(DerechoHabitacion entity)
    {
      // Asignar manualmente el siguiente id
      var maxId = await _context.DerechosHabitaciones
                                .MaxAsync(d => (int?)d.idDerechoHab) ?? 0;

      entity.idDerechoHab = maxId + 1;

      _context.DerechosHabitaciones.Add(entity);
      await _context.SaveChangesAsync();
      return entity;
    }

    public async Task UpdateAsync(DerechoHabitacion entity)
    {
      _context.DerechosHabitaciones.Update(entity);
      await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(DerechoHabitacion entity)
    {
      _context.DerechosHabitaciones.Remove(entity);
      await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsByDescripcionAsync(string descripcion)
      => await _context.DerechosHabitaciones.AnyAsync(d => d.descripcion == descripcion);
  }
}
