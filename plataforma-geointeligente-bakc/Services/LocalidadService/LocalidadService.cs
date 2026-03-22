using AutoMapper;
using SaludPublicaBackend.Dtos.LocalidadDto;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.LocalidadRepository;
using SaludPublicaBackend.Validators.LocalidadValidator;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SaludPublicaBackend.Services.LocalidadService
{
  public class LocalidadService : ILocalidadService
  {
    private readonly ILocalidadRepository _repository;
    private readonly ILocalidadValidator _validator;
    private readonly IMapper _mapper;
    private const int MaxPageSize = 200;

    public LocalidadService(ILocalidadRepository repository, ILocalidadValidator validator, IMapper mapper)
    {
      _repository = repository;
      _validator  = validator;
      _mapper     = mapper;
    }

    public async Task<PagedLocalidadDto> GetLocalidadesPagedAsync(int pageNumber, int pageSize, int idEdo, int idMpo, string? search)
    {
      if (pageNumber <= 0) throw new ArgumentException("pageNumber debe ser mayor que 0.");
      if (pageSize   <= 0) throw new ArgumentException("pageSize debe ser mayor que 0.");
      if (pageSize > MaxPageSize) pageSize = MaxPageSize;
      if (idEdo <= 0) throw new ArgumentException("idEdo debe ser mayor que 0.");
      if (idMpo <= 0) throw new ArgumentException("idMpo debe ser mayor que 0.");

      search = string.IsNullOrWhiteSpace(search) ? null : search.Trim();

      var (items, total) = await _repository.GetPagedAsync(pageNumber, pageSize, idEdo, idMpo, search);

      return new PagedLocalidadDto
      {
        Items = items,
        PageNumber = pageNumber,
        PageSize = pageSize,
        TotalCount = total,
        Search = search
      };
    }

    public async Task<GetLocalidadDto?> GetByIdAsync(int idLoc)
    {
      var entity = await _repository.GetByIdAsync(idLoc);
      if (entity == null || !entity.activo) // <-- ignorar inactivas
        return null;

      return _mapper.Map<GetLocalidadDto>(entity);
    }

    public async Task<GetLocalidadDto> RegisterAsync(RegisterLocalidadDto dto)
    {
      _validator.ValidateRegister(dto);

      var entity = _mapper.Map<Localidad>(dto);
      _validator.ValidateEntity(entity);
      entity.activo = true;
      var created = await _repository.AddAsync(entity);
      return _mapper.Map<GetLocalidadDto>(created);
    }

    public async Task<GetLocalidadDto?> UpdateAsync(int idLoc, UpdateLocalidadDto dto)
    {
      _validator.ValidateUpdate(dto);

      var existing = await _repository.GetByIdAsync(idLoc);
      if (existing == null) return null;

      _mapper.Map(dto, existing);
      _validator.ValidateEntity(existing);

      await _repository.UpdateAsync(existing);
      return _mapper.Map<GetLocalidadDto>(existing);
    }

    public async Task<bool> DeleteAsync(int idLoc)
    {
      var existing = await _repository.GetByIdAsync(idLoc);
      if (existing == null) return false;

      await _repository.DeleteAsync(existing);
      return true;
    }

    public async Task<bool> DesactivarAsync(int idLoc)
    {
      var existing = await _repository.GetByIdAsync(idLoc);
      if (existing == null)
        return false;

      existing.activo = false;
      await _repository.UpdateAsync(existing);
      return true;
    }
  }
}
