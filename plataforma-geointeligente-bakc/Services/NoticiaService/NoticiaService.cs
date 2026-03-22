using AutoMapper;
using SaludPublicaBackend.Configurations.CustomHttpResponses;
using SaludPublicaBackend.Dtos.NoticiaDto;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.NoticiaRepository;

namespace SaludPublicaBackend.Services.NoticiaService
{
  public class NoticiaService : INoticiaService
  {
    private readonly INoticiaRepository _repository;
    private readonly IMapper _mapper;

    public NoticiaService(INoticiaRepository repository, IMapper mapper)
    {
      _repository = repository;
      _mapper = mapper;
    }

    public async Task<IEnumerable<GetNoticiaDto>> GetAllAsync()
    {
      var noticias = await _repository.GetAllAsync();
      return _mapper.Map<IEnumerable<GetNoticiaDto>>(noticias);
    }

    public async Task<GetNoticiaDto> GetByIdAsync(int id)
    {
      var noticia = await _repository.GetAsync(id)
        ?? throw new NotFoundException("Noticia", id);
      return _mapper.Map<GetNoticiaDto>(noticia);
    }

    public async Task<GetNoticiaDto> CreateAsync(CreateNoticiaDto dto)
    {
      var noticia = _mapper.Map<Noticia>(dto);
      var creado = await _repository.AddAsync(noticia);
      return _mapper.Map<GetNoticiaDto>(creado);
    }

    public async Task<GetNoticiaDto> UpdateAsync(UpdateNoticiaDto dto)
    {
      var noticia = await _repository.GetAsync(dto.idNoticia)
        ?? throw new NotFoundException("Noticia", dto.idNoticia);

      _mapper.Map(dto, noticia);
      await _repository.UpdateAsync(noticia);
      return _mapper.Map<GetNoticiaDto>(noticia);
    }

    public async Task DeleteAsync(int id)
    {
      var exists = await _repository.Exists(id);
      if (!exists)
        throw new NotFoundException("Noticia", id);

      await _repository.DeleteAsync(id);
    }
  }
}