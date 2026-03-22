using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SaludPublicaBackend.Configurations.Databases;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.Generic;

namespace SaludPublicaBackend.Repositories.ActividadUsuarioRepository
{
  public class ActividadUsuarioRepository : GenericRepository<ActividadUsuario>, IActividadUsuarioRepository
  {
    private readonly AppDbContext _context;

    public ActividadUsuarioRepository(AppDbContext context, IMapper mapper) : base(context, mapper)
    {
      _context = context;
    }

    public async Task<List<ActividadUsuario>> GetByUsuarioAsync(int idUsuario)
    {
        try
        {
            return await _context.ActividadesUsuarios
                .Where(a => a.idUsuario == idUsuario)
                .ToListAsync(); // sin OrderBy
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error interno en GetByUsuarioAsync: {ex.Message}");
            throw;
        }
    }


    public async Task<List<ActividadUsuario>> GetByFechaActividadAsync(DateOnly fecha)
    {
      try
      {
        return await _context.ActividadesUsuarios
          .Where(a => a.fechaActividad == fecha)
          .OrderByDescending(a => a.hora)
          .ToListAsync();
      }
      catch (Exception ex)
      {
        throw new Exception("Ocurrió un error al obtener actividades por fecha.", ex);
      }
    }
  }
}