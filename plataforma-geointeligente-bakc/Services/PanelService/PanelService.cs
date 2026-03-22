using AutoMapper;
using SaludPublicaBackend.Configurations.CustomHttpResponses;
using SaludPublicaBackend.Dtos.PanelDto;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.PanelRepository;

namespace SaludPublicaBackend.Services.PanelService
{
  public class PanelService : IPanelService
  {
    private readonly IPanelRepository _repository;
    private readonly IMapper _mapper;

    public PanelService(IPanelRepository repository, IMapper mapper)
    {
      _repository = repository;
      _mapper = mapper;
    }

    public async Task<IEnumerable<GetPanelDto>> GetAllAsync()
    {
      var panels = await _repository.GetAllAsync();
      return _mapper.Map<IEnumerable<GetPanelDto>>(panels);
    }

    public async Task<GetPanelDto> GetByIdAsync(int id)
    {
      var panel = await _repository.GetAsync(id)
        ?? throw new NotFoundException("Panel", id);
      return _mapper.Map<GetPanelDto>(panel);
    }

    public async Task<GetPanelDto> CreateAsync(CreatePanelDto dto)
    {
      var panel = _mapper.Map<Panel>(dto);
      var creado = await _repository.AddAsync(panel);
      return _mapper.Map<GetPanelDto>(creado);
    }

    public async Task<GetPanelDto> UpdateAsync(UpdatePanelDto dto)
    {
      var panel = await _repository.GetAsync(dto.idPanel)
        ?? throw new NotFoundException("Panel", dto.idPanel);
      _mapper.Map(dto, panel);
      panel.fechaActualizacion = DateTime.Now;
      await _repository.UpdateAsync(panel);
      return _mapper.Map<GetPanelDto>(panel);
    }

    public async Task DeleteAsync(int id)
    {
      var exists = await _repository.Exists(id);
      if (!exists) throw new NotFoundException("Panel", id);
      await _repository.DeleteAsync(id);
    }
  }
}
