using Microsoft.EntityFrameworkCore;
using SaludPublicaBackend.Configurations.Databases;
using SaludPublicaBackend.Dtos.LocalidadDto;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Repositories.LocalidadRepository
{
  public class LocalidadRepository : ILocalidadRepository
  {
    private readonly AppDbContext _context;
    public LocalidadRepository(AppDbContext context) => _context = context;

    public async Task<List<Localidad>> GetAllAsync()
    {
      return await _context.Localidades
        .AsNoTracking()
        .OrderBy(l => l.idLoc) // orden por PK para reflejar el “orden de tabla”
        .ToListAsync();
    }

    public async Task<(IReadOnlyList<GetLocalidadDto> items, int totalCount)> GetPagedAsync(
      int pageNumber, int pageSize, int idEdo, int idMpo, string? search)
    {
      var query = _context.Localidades
        .AsNoTracking()
        .Where(l => l.idEdo == idEdo && l.idMpo == idMpo && l.activo); // <-- solo activas

      if (!string.IsNullOrWhiteSpace(search))
      {
        query = query.Where(l => l.nombreLocalidad != null && l.nombreLocalidad.Contains(search));
      }

      var totalCount = await query.CountAsync();

      var items = await query
        .OrderBy(l => l.idLoc)
        .Skip((pageNumber - 1) * pageSize)
        .Take(pageSize)
        .Select(l => new GetLocalidadDto
        {
          idLoc = l.idLoc,
          idLocalidad = l.idLocalidad,
          idMpo = l.idMpo,
          idEdo = l.idEdo,
          nombreLocalidad = l.nombreLocalidad
        })
        .ToListAsync();

      return (items, totalCount);
    }

    public async Task<Localidad?> GetByIdAsync(int idLoc)
      => await _context.Localidades.FindAsync(idLoc);


    public async Task<Localidad> AddAsync(Localidad localidad)
    {
      // Calcular el siguiente idLocalidad para este municipio/estado
      var maxIdLocalidad = await _context.Localidades
                                         .Where(l => l.idMpo == localidad.idMpo && l.idEdo == localidad.idEdo)
                                         .MaxAsync(l => (int?)l.idLocalidad) ?? 0;

      localidad.idLocalidad = maxIdLocalidad + 1;

      _context.Localidades.Add(localidad);
      await _context.SaveChangesAsync();
      return localidad;
    }

    public async Task UpdateAsync(Localidad localidad)
    {
      _context.Localidades.Update(localidad);
      await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Localidad localidad)
    {
      _context.Localidades.Remove(localidad);
      await _context.SaveChangesAsync();
    }
  }
}
