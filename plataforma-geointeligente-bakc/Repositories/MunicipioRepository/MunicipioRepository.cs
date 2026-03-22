using Microsoft.EntityFrameworkCore;
using SaludPublicaBackend.Configurations.Databases;
using SaludPublicaBackend.Dtos.MunicipioDto;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Repositories.MunicipioRepository
{
  public class MunicipioRepository : IMunicipioRepository
  {
    private readonly AppDbContext _context;

    public MunicipioRepository(AppDbContext context)
    {
      _context = context;
    }

    public async Task<(IReadOnlyList<GetMunicipioDto> items, int totalCount)> GetPagedAsync(int pageNumber, int pageSize, int idEstado, string? search)
    {
      var query = _context.Municipios
        .AsNoTracking()
        .Where(m => m.idEstado == idEstado);

      if (!string.IsNullOrWhiteSpace(search))
      {
        query = query.Where(m => m.nombreMunicipio != null && m.nombreMunicipio.Contains(search));
      }

      var totalCount = await query.CountAsync();

      var items = await query
        .OrderBy(m => m.idMunicipio)
        .Skip((pageNumber - 1) * pageSize)
        .Take(pageSize)
        .Select(m => new GetMunicipioDto
        {
          idMunicipio = m.idMunicipio,
          idMpo = m.idMpo,
          nombreMunicipio = m.nombreMunicipio,
          idEstado = m.idEstado
        })
        .ToListAsync();

      return (items, totalCount);
    }

    public async Task<Municipio?> GetByIdAsync(int idMunicipio)
      => await _context.Municipios.FindAsync(idMunicipio);

    public async Task<Municipio> AddAsync(Municipio municipio)
    {
      // Calcular el siguiente idMpo para este estado
      var maxIdMpo = await _context.Municipios
                                   .Where(m => m.idEstado == municipio.idEstado)
                                   .MaxAsync(m => (int?)m.idMpo) ?? 0;

      municipio.idMpo = maxIdMpo + 1;

      _context.Municipios.Add(municipio);
      await _context.SaveChangesAsync();
      return municipio;
    }

    public async Task UpdateAsync(Municipio municipio)
    {
      _context.Municipios.Update(municipio);
      await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Municipio municipio)
    {
      _context.Municipios.Remove(municipio);
      await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsByIdMpoAsync(int idMpo)
      => await _context.Municipios.AnyAsync(m => m.idMpo == idMpo);
  }
}
