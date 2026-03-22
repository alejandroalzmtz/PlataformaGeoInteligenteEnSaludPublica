using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SaludPublicaBackend.Configurations.Databases;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.Generic;
using SaludPublicaBackend.Repositories.RolRepository;
using System;

namespace SaludPublicaBackend.Repositories.RangoEdadRepository
{
  public class RangoEdadRepository : GenericRepository<RangoEdad>, IRangoEdadRepository
  {
    private readonly AppDbContext _context;
    public RangoEdadRepository(AppDbContext context, IMapper mapper) : base(context, mapper)
    {
      _context = context;
    }

    public async Task<bool> ExistsByRangoAsync(int rangoInicial, int rangoFinal)
    {
      try
      {
        return await _context.RangoEdad.AnyAsync(r =>
          r.RangoInicial == rangoInicial && r.RangoFinal == rangoFinal);
      }
      catch (Exception ex)
      {
        throw new Exception("Ocurrió un error al verificar la existencia del rango de edad.", ex);
      }
    }

    public async Task<RangoEdad?> GetByRangoAsync(int rangoInicial, int rangoFinal)
    {
      try
      {
        return await _context.RangoEdad.FirstOrDefaultAsync(r =>
          r.RangoInicial == rangoInicial && r.RangoFinal == rangoFinal);
      }
      catch (Exception ex)
      {
        throw new Exception("Ocurrió un error al obtener el rango de edad.", ex);
      }
    }

    public async Task<bool> ExistsByNombreRangoEdadAsync(int rangoInicial, int rangoFinal)
    {
      return await ExistsByRangoAsync(rangoInicial, rangoFinal);
    }

    public async Task<RangoEdad?> GetByNombreRangoEdadAsync(int rangoInicial, int rangoFinal)
    {
      return await GetByRangoAsync(rangoInicial, rangoFinal);
    }
  }
}
