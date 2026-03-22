using AutoMapper;
using SaludPublicaBackend.Dtos.ProcedenciaDto;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.ProcedenciaRepository;
using SaludPublicaBackend.Validators.ProcedenciaValidator;

namespace SaludPublicaBackend.Services.ProcedenciaService
{
  public class ProcedenciaService : IProcedenciaService
  {
    private readonly IProcedenciaRepository _repository;
    private readonly IProcedenciaValidator _validator;
    private readonly IMapper _mapper;

    public ProcedenciaService(IProcedenciaRepository repository, IProcedenciaValidator validator, IMapper mapper)
    {
      _repository = repository;
      _validator  = validator;
      _mapper     = mapper;
    }

    public async Task<IEnumerable<GetProcedenciaDto>> GetProcedenciasAsync()
    {
      var data = await _repository.GetAllAsync();
      _validator.ValidateList(data);
      return _mapper.Map<IEnumerable<GetProcedenciaDto>>(data);
    }

    public async Task<GetProcedenciaDto?> GetByIdAsync(int idProcedencia)
    {
      var entity = await _repository.GetByIdAsync(idProcedencia);
      return entity == null ? null : _mapper.Map<GetProcedenciaDto>(entity);
    }

    public async Task<GetProcedenciaDto> RegisterAsync(RegisterProcedenciaDto dto)
    {
      _validator.ValidateRegister(dto);

      var normalized = dto.descripcion.Trim().ToUpper();
      var exists = await _repository.ExistsByDescripcionAsync(normalized);
      if (exists)
        throw new Exception("La procedencia ya existe.");

      var entity = _mapper.Map<Procedencia>(dto);
      entity.descripcion = normalized;

      // 🔹 Como idProcedencia no es IDENTITY, lo generamos manualmente
      entity.idProcedencia = await _repository.GetNextIdAsync();

      _validator.ValidateEntity(entity);

      var created = await _repository.AddAsync(entity);
      return _mapper.Map<GetProcedenciaDto>(created);
    }

    public async Task<GetProcedenciaDto?> UpdateAsync(int idProcedencia, UpdateProcedenciaDto dto)
    {
      _validator.ValidateUpdate(dto);

      var existing = await _repository.GetByIdAsync(idProcedencia);
      if (existing == null) return null;

      _mapper.Map(dto, existing);
      if (!string.IsNullOrWhiteSpace(existing.descripcion))
        existing.descripcion = existing.descripcion.Trim().ToUpper();

      _validator.ValidateEntity(existing);

      await _repository.UpdateAsync(existing);
      return _mapper.Map<GetProcedenciaDto>(existing);
    }

    public async Task<bool> DeleteAsync(int idProcedencia)
    {
      var existing = await _repository.GetByIdAsync(idProcedencia);
      if (existing == null) return false;

      await _repository.DeleteAsync(existing);
      return true;
    }
  }
}
