using AutoMapper;
using SaludPublicaBackend.Dtos.DerechoHabDto;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.DerechoHabRepository;
using SaludPublicaBackend.Validators.DerechoHabValidator;
using System;


namespace SaludPublicaBackend.Services.DerechoHabService
{
  public class DerechoHabService : IDerechoHabService
  {
    private readonly IDerechoHabRepository _repository;
    private readonly IDerechoHabValidator _validator;
    private readonly IMapper _mapper;
    private const int MaxPageSize = 200;

    public DerechoHabService(IDerechoHabRepository repository, IDerechoHabValidator validator, IMapper mapper)
    {
      _repository = repository;
      _validator = validator;
      _mapper = mapper;
    }

    public async Task<PagedDerechoHabDto> GetPagedAsync(int pageNumber, int pageSize, string? search)
    {
      if (pageNumber <= 0) throw new ArgumentException("pageNumber debe ser mayor que 0.");
      if (pageSize <= 0) throw new ArgumentException("pageSize debe ser mayor que 0.");
      if (pageSize > MaxPageSize) pageSize = MaxPageSize;

      search = string.IsNullOrWhiteSpace(search) ? null : search.Trim();

      var (items, total) = await _repository.GetPagedAsync(pageNumber, pageSize, search);

      return new PagedDerechoHabDto
      {
        Items = items,
        PageNumber = pageNumber,
        PageSize = pageSize,
        TotalCount = total,
        Search = search
      };
    }

    public async Task<GetDerechoHabDto?> GetByIdAsync(int idDerechoHab)
    {
      var entity = await _repository.GetByIdAsync(idDerechoHab);
      return entity == null ? null : _mapper.Map<GetDerechoHabDto>(entity);
    }

    public async Task<GetDerechoHabDto> RegisterAsync(RegisterDerechoHabDto dto)
    {
      _validator.ValidateRegister(dto);

      var normalized = dto.descripcion.Trim().ToUpper();
      var exists = await _repository.ExistsByDescripcionAsync(normalized);
      if (exists)
        throw new Exception("El derechohabiente ya existe.");

      var entity = _mapper.Map<DerechoHabitacion>(dto);
      entity.descripcion = normalized;

      _validator.ValidateEntity(entity);

      var created = await _repository.AddAsync(entity);
      return _mapper.Map<GetDerechoHabDto>(created);
    }

    public async Task<GetDerechoHabDto?> UpdateAsync(int idDerechoHab, UpdateDerechoHabDto dto)
    {
      _validator.ValidateUpdate(dto);

      var existing = await _repository.GetByIdAsync(idDerechoHab);
      if (existing == null) return null;

      _mapper.Map(dto, existing);
      if (!string.IsNullOrWhiteSpace(existing.descripcion))
        existing.descripcion = existing.descripcion.Trim().ToUpper();

      _validator.ValidateEntity(existing);

      await _repository.UpdateAsync(existing);
      return _mapper.Map<GetDerechoHabDto>(existing);
    }

    public async Task<bool> DeleteAsync(int idDerechoHab)
    {
      var existing = await _repository.GetByIdAsync(idDerechoHab);
      if (existing == null) return false;

      await _repository.DeleteAsync(existing);
      return true;
    }
  }
}
