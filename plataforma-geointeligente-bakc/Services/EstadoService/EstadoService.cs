using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SaludPublicaBackend.Dtos.EstadosDto;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.EstadoRepository;
using SaludPublicaBackend.Validators.EstadoValidator;

namespace SaludPublicaBackend.Services.EstadoService
{
  public class EstadoService : IEstadoService
  {
    private readonly IEstadoRepository _repository;
    private readonly IEstadoValidator _validator;
    private readonly IMapper _mapper;

    private const int MaxPageSize = 200;

    public EstadoService(IEstadoRepository repository, IEstadoValidator validator, IMapper mapper)
    {
      _repository = repository;
      _validator  = validator;
      _mapper     = mapper;
    }

    public async Task<IEnumerable<GetEstadosDto>> GetEstadosAsync()
    {
      var data = await _repository.GetAllAsync();
      var activos = data.Where(e => e.activo).ToList();
      _validator.ValidateList(activos);
      return _mapper.Map<IEnumerable<GetEstadosDto>>(activos);
    }

    public async Task<PagedEstadosDto> GetEstadosPagedAsync(int pageNumber, int pageSize, string? search)
    {
      if (pageNumber <= 0) throw new ArgumentException("pageNumber debe ser mayor que 0.");
      if (pageSize   <= 0) throw new ArgumentException("pageSize debe ser mayor que 0.");
      if (pageSize > MaxPageSize) pageSize = MaxPageSize;

      search = string.IsNullOrWhiteSpace(search) ? null : search.Trim();

      var (items, total) = await _repository.GetPagedAsync(pageNumber, pageSize, search);

      return new PagedEstadosDto
      {
        Items = items,
        PageNumber = pageNumber,
        PageSize = pageSize,
        TotalCount = total,
        Search = search
      };
    }

    public async Task<GetEstadosDto> RegisterEstadoAsync(RegisterEstadoDto dto)
    {
      try
      {
        var nombre = dto.nombreEstado.Trim().ToUpper();

        var exists = await _repository.ExistsByNombreAsync(nombre);
        if (exists)
          throw new Exception("El estado ya existe.");

        var entity = _mapper.Map<Estado>(dto);
        entity.nombreEstado = nombre;

        // Asegurar que siempre se registre como activo
        entity.activo = true;

        // Generar nuevo id manualmente
        entity.idEstado = await _repository.GetNextIdAsync();

        var created = await _repository.AddAsync(entity);
        return _mapper.Map<GetEstadosDto>(created);
      }
      catch (DbUpdateException ex)
      {
        Console.WriteLine("DB ERROR: " + (ex.InnerException?.Message ?? ex.Message));
        throw;
      }
    }

    public async Task<GetEstadosDto?> UpdateEstadoAsync(int id, UpdateEstadoDto dto)
    {
      var existing = await _repository.GetByIdAsync(id);
      if (existing == null) return null;

      _mapper.Map(dto, existing);
      await _repository.UpdateAsync(existing);

      return _mapper.Map<GetEstadosDto>(existing);
    }

    public async Task<GetEstadosDto?> GetEstadoByIdAsync(int id)
    {
      var entity = await _repository.GetByIdAsync(id);
      if (entity == null) return null;
      return _mapper.Map<GetEstadosDto>(entity);
    }

    public async Task<bool> DeleteEstadoAsync(int id)
    {
      var existing = await _repository.GetByIdAsync(id);
      if (existing == null) return false;

      await _repository.DeleteAsync(existing);
      return true;
    }

    // NUEVO: desactivar (borrado lógico)
    public async Task<bool> DesactivarEstadoAsync(int id)
    {
      var existing = await _repository.GetByIdAsync(id);
      if (existing == null)
        return false;

      existing.activo = false;
      await _repository.UpdateAsync(existing);
      return true;
    }
  }
}