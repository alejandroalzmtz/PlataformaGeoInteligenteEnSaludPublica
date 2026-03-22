using AutoMapper;
using SaludPublicaBackend.Dtos.EnfermedadDto;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.EnfermedadRepository;
using SaludPublicaBackend.Validators.EnfermedadValidator;

namespace SaludPublicaBackend.Services.EnfermedadService
{
  public class EnfermedadService : IEnfermedadService
  {
    private readonly IEnfermedadRepository _enfermedadRepository;
    private readonly IEnfermedadValidator _validator;
    private readonly IMapper _mapper;

    public EnfermedadService(
      IEnfermedadRepository enfermedadRepository,
      IEnfermedadValidator validator,
      IMapper mapper)
    {
      _enfermedadRepository = enfermedadRepository;
      _validator            = validator;
      _mapper               = mapper;
    }

    public async Task<IEnumerable<GetEnfermedadDto>> GetEnfermedades()
    {
      var items = (await _enfermedadRepository.GetAllAsync<GetEnfermedadDto>())
        .Where(e => e.activo)   // ahora sí existe
        .ToList();

      _validator.IsEnfermedadListValid(items);

      foreach (var item in items)
      {
        if (!string.IsNullOrWhiteSpace(item.codigoICD))
          item.idEnfermedad = item.codigoICD;
      }

      return items;
    }

    public async Task<GetEnfermedadDto> RegisterEnfermedad(RegisterEnfermedadDto dto)
    {
      _validator.ValidateCreate(dto);

      var exists = await _enfermedadRepository.ExistsByCodigoICDAsync(dto.codigoICD);
      _validator.ValidateNotDuplicateByCodigoICD(exists);

      var entidad = _mapper.Map<Enfermedad>(dto);
      entidad.codigoICD    = dto.codigoICD;
      entidad.idEnfermedad = dto.codigoICD;

      // aseguramos que se registre activa
      entidad.activo = true;

      var creada = await _enfermedadRepository.AddAsync(entidad);

      var salida = _mapper.Map<GetEnfermedadDto>(creada);
      salida.idEnfermedad = salida.codigoICD;

      return salida;
    }

    public async Task<GetEnfermedadDto> UpdateEnfermedad(string idEnfermedad, UpdateEnfermedadDto dto)
    {
      if (string.IsNullOrWhiteSpace(idEnfermedad))
        throw new ArgumentException("El idEnfermedad es requerido.", nameof(idEnfermedad));

      var entidad = await _enfermedadRepository.GetAsync(idEnfermedad);
      if (entidad is null)
        throw new KeyNotFoundException("La enfermedad no existe.");

      // No tocamos codigoICD, solo otros campos
      entidad.nombreEnfermedad = dto.nombreEnfermedad;
      entidad.descripcion = dto.descripcion;

      await _enfermedadRepository.UpdateAsync(entidad);

      var salida = _mapper.Map<GetEnfermedadDto>(entidad);

      // Si quieres seguir forzando que idEnfermedad == codigoICD:
      // salida.idEnfermedad = salida.codigoICD;

      return salida;
    }

    public async Task DeleteEnfermedad(string idEnfermedad)
    {
      if (string.IsNullOrWhiteSpace(idEnfermedad))
        throw new ArgumentException("El idEnfermedad es requerido.", nameof(idEnfermedad));

      // Buscar por PK (idEnfermedad)
      var entidad = await _enfermedadRepository.GetAsync(idEnfermedad);
      if (entidad is null)
        throw new KeyNotFoundException("La enfermedad no existe.");

      // Borrar por clave (idEnfermedad), que es única
      await _enfermedadRepository.DeleteAsync(idEnfermedad);
    }

    public async Task DesactivarEnfermedad(string idEnfermedad)
    {
      if (string.IsNullOrWhiteSpace(idEnfermedad))
        throw new ArgumentException("El idEnfermedad es requerido.", nameof(idEnfermedad));

      var entidad = await _enfermedadRepository.GetAsync(idEnfermedad);
      if (entidad is null)
        throw new KeyNotFoundException("La enfermedad no existe.");

      entidad.activo = false;
      await _enfermedadRepository.UpdateAsync(entidad);
    }
  }
}