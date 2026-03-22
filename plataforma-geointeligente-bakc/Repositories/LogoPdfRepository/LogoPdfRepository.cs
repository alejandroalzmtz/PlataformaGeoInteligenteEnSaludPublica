using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SaludPublicaBackend.Configurations.Databases;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.Generic;

namespace SaludPublicaBackend.Repositories.LogoPdfRepository
{
  public class LogoPdfRepository : GenericRepository<LogoPdf>, ILogoPdfRepository
  {
    private readonly AppDbContext _context;

    public LogoPdfRepository(AppDbContext context, IMapper mapper) : base(context, mapper)
    {
      _context = context;
    }

    public async Task<LogoPdf?> GetActivoAsync()
    {
      return await _context.LogosPdf
        .AsNoTracking()
        .FirstOrDefaultAsync(l => l.EsActivo);
    }

    public async Task DesactivarTodosAsync()
    {
      await _context.LogosPdf
        .Where(l => l.EsActivo)
        .ExecuteUpdateAsync(s => s.SetProperty(l => l.EsActivo, false));
    }

    public async Task DeleteAllAsync()
    {
      await _context.LogosPdf.ExecuteDeleteAsync();
    }
  }
}
