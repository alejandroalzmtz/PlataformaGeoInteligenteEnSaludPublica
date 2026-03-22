using Microsoft.EntityFrameworkCore;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Dtos.EstadosDto;
using SaludPublicaBackend.Configurations.Databases; // <- usa AppDbContext

namespace SaludPublicaBackend.Repositories.EstadoRepository
{
  public class EstadoRepository : IEstadoRepository
  {
    private readonly AppDbContext _context;   // <- cambiar tipo

    public EstadoRepository(AppDbContext context) // <- cambiar tipo
    {
      _context = context;
    }

    public async Task<List<Estado>> GetAllAsync()
      => await _context.Estados.ToListAsync(); // <- usar DbSet correcto

    public async Task<(IReadOnlyList<GetEstadosDto> items, int totalCount)> GetPagedAsync(int pageNumber, int pageSize, string? search)
    {
      // Solo estados activos
      var query = _context.Estados
        .AsNoTracking()
        .Where(e => e.activo);   // <-- filtro por activo = true

      if (!string.IsNullOrWhiteSpace(search))
      {
        query = query.Where(e => e.nombreEstado != null && e.nombreEstado.Contains(search));
      }

      var totalCount = await query.CountAsync();

      var items = await query
        .OrderBy(e => e.idEstado)
        .Skip((pageNumber - 1) * pageSize)
        .Take(pageSize)
        .Select(e => new GetEstadosDto
        {
          idEstado = e.idEstado,
          nombreEstado = e.nombreEstado ?? string.Empty
        })
        .ToListAsync();

      return (items, totalCount);
    }

    public async Task<Estado> AddAsync(Estado estado)
    {
      _context.Estados.Add(estado);
      await _context.SaveChangesAsync();
      return estado;
    }

    public async Task<Estado?> GetByIdAsync(int id)
      => await _context.Estados.FindAsync(id);

    public async Task UpdateAsync(Estado estado)
    {
      _context.Estados.Update(estado);
      await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Estado estado)
    {
      _context.Estados.Remove(estado);
      await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsByNombreAsync(string nombreEstado)
      => await _context.Estados.AnyAsync(e => e.nombreEstado == nombreEstado);

    public async Task<Estado?> GetByNombreAsync(string nombreEstado)
      => await _context.Estados.FirstOrDefaultAsync(e => e.nombreEstado == nombreEstado);

    public async Task<int> GetNextIdAsync()
    {
      var maxId = await _context.Estados
        .MaxAsync(e => (int?)e.idEstado) ?? 0;

      return maxId + 1;
    }
  }
}
