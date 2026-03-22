using AutoMapper;
using SaludPublicaBackend.Configurations.Databases;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.Generic;

namespace SaludPublicaBackend.Repositories.NoticiaRepository
{
  public class NoticiaRepository : GenericRepository<Noticia>, INoticiaRepository
  {
    private readonly AppDbContext _context;

    public NoticiaRepository(AppDbContext context, IMapper mapper) : base(context, mapper)
    {
      _context = context;
    }
  }
}