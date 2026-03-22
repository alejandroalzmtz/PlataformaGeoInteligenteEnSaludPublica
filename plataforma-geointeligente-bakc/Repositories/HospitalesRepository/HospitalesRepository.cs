using Microsoft.EntityFrameworkCore;
using SaludPublicaBackend.Configurations.Databases;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Repositories.HospitalesRepository
{
  public class HospitalesRepository : IHospitalesRepository
  {
    private readonly AppDbContext _context;

    public HospitalesRepository(AppDbContext context)
    {
      _context = context;
    }

    public async Task<List<Hospitales>> GetAllAsync()
    {
      return await _context.Hospitales.AsNoTracking().ToListAsync();
    }

        public async Task<(List<Hospitales> Items, int TotalCount)> GetPagedAsync(
      int page,
      int pageSize,
      int? estado = null,
      int? municipio = null,
      int? localidad = null,
      string? search = null
    )
        {
            IQueryable<Hospitales> query = _context.Hospitales.AsNoTracking();

            // Filtros opcionales
            if (estado.HasValue)
                query = query.Where(h => h.Estado == estado.Value);

            if (municipio.HasValue)
                query = query.Where(h => h.Municipio == municipio.Value);

            if (localidad.HasValue)
                query = query.Where(h => h.Localidad == localidad.Value);

            // Búsqueda opcional (CLUES / NombreUnidad / NombreInstitucion)
            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim();
                query = query.Where(h =>
                  h.CLUES.Contains(s) ||
                  h.NombreUnidad.Contains(s) ||
                  h.NombreInstitucion.Contains(s)
                );
            }

            var total = await query.CountAsync();

            var items = await query
              .OrderBy(h => h.NombreUnidad)
              .ThenBy(h => h.CLUES)
              .Skip((page - 1) * pageSize)
              .Take(pageSize)
              .ToListAsync();

            return (items, total);
        }
    }
}
