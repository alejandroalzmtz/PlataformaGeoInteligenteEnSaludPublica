using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SaludPublicaBackend.Dtos.MotivosEDto;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.MotivosERepository;
using SaludPublicaBackend.Validators.MotivosEValidator;
using System;

namespace SaludPublicaBackend.Services.MotivosEService
{
  public class MotivosEService : IMotivosEService
  {
    private readonly IMotivosERepository _repository;
    private readonly IMotivosEValidator _validator;
    private readonly IMapper _mapper;
    private const int MaxPageSize = 200;

    public MotivosEService(IMotivosERepository repository, IMotivosEValidator validator, IMapper mapper)
    {
      _repository = repository;
      _validator = validator;
      _mapper = mapper;
    }

    public async Task<PagedMotivosEDto> GetPagedAsync(int pageNumber, int pageSize, string? search)
    {
      if (pageNumber <= 0) throw new ArgumentException("pageNumber debe ser mayor que 0.");
      if (pageSize <= 0) throw new ArgumentException("pageSize debe ser mayor que 0.");
      if (pageSize > MaxPageSize) pageSize = MaxPageSize;

      search = string.IsNullOrWhiteSpace(search) ? null : search.Trim();

      var (items, total) = await _repository.GetPagedAsync(pageNumber, pageSize, search);

      return new PagedMotivosEDto
      {
        Items = items,
        PageNumber = pageNumber,
        PageSize = pageSize,
        TotalCount = total,
        Search = search
      };
    }

    public async Task<GetMotivosEDto?> GetByIdAsync(int idMotivoEgreso)
    {
      var entity = await _repository.GetByIdAsync(idMotivoEgreso);
      return entity == null ? null : _mapper.Map<GetMotivosEDto>(entity);
    }

    public async Task<GetMotivosEDto> RegisterAsync(RegisterMotivosEDto dto)
    {
      _validator.ValidateRegister(dto);

      var normalized = dto.descripcion.Trim().ToUpper();

      var exists = await _repository.ExistsByDescripcionAsync(normalized);
      if (exists)
        throw new Exception("El motivo de egreso ya existe.");

      var entity = _mapper.Map<MotivoEgreso>(dto);
      entity.descripcion = normalized;

      // 🔹 Asignar manualmente el siguiente ID porque la columna NO es IDENTITY:
      entity.idMotivoEgreso = await _repository.GetNextIdAsync();

      _validator.ValidateEntity(entity);

      try
      {
        var created = await _repository.AddAsync(entity);
        return _mapper.Map<GetMotivosEDto>(created);
      }
      catch (DbUpdateException ex)
      {
        Console.WriteLine("DB ERROR MotivoEgreso: " + (ex.InnerException?.Message ?? ex.Message));
        throw;
      }
    }

    public async Task<GetMotivosEDto?> UpdateAsync(int idMotivoEgreso, UpdateMotivosEDto dto)
    {
      _validator.ValidateUpdate(dto);

      var existing = await _repository.GetByIdAsync(idMotivoEgreso);
      if (existing == null) return null;

      _mapper.Map(dto, existing);
      if (!string.IsNullOrWhiteSpace(existing.descripcion))
        existing.descripcion = existing.descripcion.Trim().ToUpper();

      _validator.ValidateEntity(existing);

      await _repository.UpdateAsync(existing);
      return _mapper.Map<GetMotivosEDto>(existing);
    }

    public async Task<bool> DeleteAsync(int idMotivoEgreso)
    {
      var existing = await _repository.GetByIdAsync(idMotivoEgreso);
      if (existing == null) return false;

      await _repository.DeleteAsync(existing);
      return true;
    }
  }
}
