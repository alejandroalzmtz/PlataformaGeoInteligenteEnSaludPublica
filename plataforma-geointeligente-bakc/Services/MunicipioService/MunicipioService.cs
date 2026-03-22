using AutoMapper;
using SaludPublicaBackend.Dtos.MunicipioDto;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.MunicipioRepository;
using SaludPublicaBackend.Validators.MunicipioValidator;

namespace SaludPublicaBackend.Services.MunicipioService
{
  public class MunicipioService : IMunicipioService
  {
    private readonly IMunicipioRepository _repository;
    private readonly IMunicipioValidator _validator;
    private readonly IMapper _mapper;
    private const int MaxPageSize = 200;

    public MunicipioService(IMunicipioRepository repository, IMunicipioValidator validator, IMapper mapper)
    {
      _repository = repository;
      _validator = validator;
      _mapper = mapper;
    }

    public async Task<PagedMunicipioDto> GetMunicipiosPagedAsync(int pageNumber, int pageSize, int idEstado, string? search)
    {
      if (pageNumber <= 0) throw new ArgumentException("pageNumber debe ser mayor que 0.");
      if (pageSize <= 0) throw new ArgumentException("pageSize debe ser mayor que 0.");
      if (pageSize > MaxPageSize) pageSize = MaxPageSize;
      if (idEstado <= 0) throw new ArgumentException("idEstado debe ser mayor que 0.");

      search = string.IsNullOrWhiteSpace(search) ? null : search.Trim();

      var (items, total) = await _repository.GetPagedAsync(pageNumber, pageSize, idEstado, search);

      return new PagedMunicipioDto
      {
        Items = items,
        PageNumber = pageNumber,
        PageSize = pageSize,
        TotalCount = total,
        Search = search
      };
    }



    public async Task<GetMunicipioDto?> GetByIdAsync(int idMunicipio)
    {
      var entity = await _repository.GetByIdAsync(idMunicipio);
      if (entity == null || !entity.activo) // <-- no devolver inactivos
        return null;

      return _mapper.Map<GetMunicipioDto>(entity);
    }

    public async Task<GetMunicipioDto> RegisterAsync(RegisterMunicipioDto dto)
    {
      _validator.ValidateRegister(dto);

      var entity = _mapper.Map<Municipio>(dto);
      _validator.ValidateEntity(entity);

      entity.activo = true;

      var created = await _repository.AddAsync(entity);
      return _mapper.Map<GetMunicipioDto>(created);
    }

    public async Task<GetMunicipioDto?> UpdateAsync(int idMunicipio, UpdateMunicipioDto dto)
    {
      _validator.ValidateUpdate(dto);

      var existing = await _repository.GetByIdAsync(idMunicipio);
      if (existing == null) return null;

      _mapper.Map(dto, existing);
      _validator.ValidateEntity(existing);

      await _repository.UpdateAsync(existing);
      return _mapper.Map<GetMunicipioDto>(existing);
    }

    public async Task<bool> DeleteAsync(int idMunicipio)
    {
      var existing = await _repository.GetByIdAsync(idMunicipio);
      if (existing == null) return false;

      await _repository.DeleteAsync(existing);
      return true;
    }
    public async Task<bool> DesactivarAsync(int idMunicipio)
    {
      var existing = await _repository.GetByIdAsync(idMunicipio);
      if (existing == null)
        return false;

      existing.activo = false;
      await _repository.UpdateAsync(existing);
      return true;
    }
  }
}
