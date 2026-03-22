using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SaludPublicaBackend.Configurations.Databases;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.Generic;
using System;
using System.Threading.Tasks;

namespace SaludPublicaBackend.Repositories.RolRepository
{
  public class RolRepository : GenericRepository<Rol>, IRolRepository
  {
    private readonly AppDbContext _context;

    public RolRepository(AppDbContext context, IMapper mapper) : base(context, mapper)
    {
      _context = context;
    }

    public async Task<bool> ExistsByNombreRolAsync(string nombreRol)
    {
      try
      {
        return await _context.Roles.AnyAsync(r => r.nombreRol == nombreRol);
      }
      catch (Exception ex)
      {
        throw new Exception("Ocurrió un error al verificar la existencia del rol por nombre.", ex);
      }
    }

    public async Task<Rol?> GetByNombreRolAsync(string nombreRol)
    {
      try
      {
        return await _context.Roles.FirstOrDefaultAsync(r => r.nombreRol == nombreRol);
      }
      catch (Exception ex)
      {
        throw new Exception("Ocurrió un error al obtener el rol por nombre.", ex);
      }
    }
  }
}
