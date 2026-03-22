using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SaludPublicaBackend.Configurations.Databases;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.Generic;

namespace SaludPublicaBackend.Repositories.EnfermedadRepository
{
  public class EnfermedadRepository : GenericRepository<Enfermedad>, IEnfermedadRepository
  {
    private readonly AppDbContext _context;

    public EnfermedadRepository(AppDbContext context, IMapper mapper) : base(context, mapper)
    {
      _context = context;
    }

    public async Task<bool> ExistsByCodigoICDAsync(string codigoICD) 
    {
      try
      {
        return await _context.Enfermedades.AnyAsync(e => e.codigoICD == codigoICD);
      }
      catch (Exception ex)
      {
        throw new Exception("Ocurrió un error al verificar la existencia por codigoICD.", ex);
      }
    }

    public async Task<Enfermedad?> GetByCodigoICDAsync(string codigoICD)
    {
      try
      {
        return await _context.Enfermedades.FirstOrDefaultAsync(e => e.codigoICD == codigoICD);
      }
      catch (Exception ex)
      {
        throw new Exception("Ocurrió un error al obtener la enfermedad por codigoICD.", ex);
      }
    }
  }
}
