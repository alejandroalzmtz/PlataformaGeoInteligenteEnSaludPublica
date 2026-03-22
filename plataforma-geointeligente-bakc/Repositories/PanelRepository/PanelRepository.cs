using AutoMapper;
using SaludPublicaBackend.Configurations.Databases;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.Generic;

namespace SaludPublicaBackend.Repositories.PanelRepository
{
  public class PanelRepository : GenericRepository<Panel>, IPanelRepository
  {
    private readonly AppDbContext _context;

    public PanelRepository(AppDbContext context, IMapper mapper) : base(context, mapper)
    {
      _context = context;
    }
  }
}
