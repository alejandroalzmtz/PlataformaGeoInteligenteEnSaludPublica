using AutoMapper;
using SaludPublicaBackend.Dtos.ServicioMedicoDto;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.ServicioMedicoReposiotry;
using SaludPublicaBackend.Validators.ServicioMedicoValidator;

namespace SaludPublicaBackend.Services.ServicioMedicoService
{
  public class ServicioMedicoService : IServicioMedicoService
  {
    private readonly IServicioMedicoRepository _repository;
    private readonly IServicioMedicoValidator _validator;
    private readonly IMapper _mapper;
    private const int MaxPageSize = 200;

    public ServicioMedicoService(IServicioMedicoRepository repository, IServicioMedicoValidator validator, IMapper mapper)
    {
      _repository = repository;
      _validator  = validator;
      _mapper     = mapper;
    }

    public async Task<PagedServicioMedicoDto> GetServiciosAsync(int pageNumber, int pageSize, string? search)
    {
      if (pageNumber <= 0) throw new ArgumentException("pageNumber debe ser mayor que 0.");
      if (pageSize   <= 0) throw new ArgumentException("pageSize debe ser mayor que 0.");
      if (pageSize > MaxPageSize) pageSize = MaxPageSize;

      var (items, total) = await _repository.GetPagedAsync(pageNumber, pageSize, search);
      _validator.ValidateList(items);

      return new PagedServicioMedicoDto
      {
        Items      = _mapper.Map<IEnumerable<GetServicioMedicoDto>>(items),
        PageNumber = pageNumber,
        PageSize   = pageSize,
        TotalCount = total
      };
    }

    public async Task<GetServicioMedicoDto?> GetByIdAsync(int idServicio)
    {
      var entity = await _repository.GetByIdAsync(idServicio);
      return entity == null ? null : _mapper.Map<GetServicioMedicoDto>(entity);
    }

    public async Task<GetServicioMedicoDto> RegisterAsync(RegisterServicioMedicoDto dto)
    {
      _validator.ValidateRegister(dto);

      var normalized = dto.nombreServicio.Trim().ToUpper();

      var exists = await _repository.ExistsByNombreAsync(normalized);
      if (exists)
        throw new Exception("El servicio médico ya existe.");

      var entity = _mapper.Map<ServicioMedico>(dto);
      entity.nombreServicio = normalized;

      _validator.ValidateEntity(entity);

      var created = await _repository.AddAsync(entity);
      return _mapper.Map<GetServicioMedicoDto>(created);
    }

    public async Task<GetServicioMedicoDto?> UpdateAsync(int idServicio, UpdateServicioMedicoDto dto)
    {
      _validator.ValidateUpdate(dto);

      var existing = await _repository.GetByIdAsync(idServicio);
      if (existing == null) return null;

      _mapper.Map(dto, existing);
      if (!string.IsNullOrWhiteSpace(existing.nombreServicio))
        existing.nombreServicio = existing.nombreServicio.Trim().ToUpper();

      _validator.ValidateEntity(existing);

      await _repository.UpdateAsync(existing);
      return _mapper.Map<GetServicioMedicoDto>(existing);
    }

    public async Task<bool> DeleteAsync(int idServicio)
    {
      var existing = await _repository.GetByIdAsync(idServicio);
      if (existing == null) return false;

      await _repository.DeleteAsync(existing);
      return true;
    }
  }
}
