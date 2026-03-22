using AutoMapper;
using SaludPublicaBackend.Dtos.ActividadUsuarioDto;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.ActividadUsuarioRepository;
using SaludPublicaBackend.Validators.ActividadUsuarioValidators;

namespace SaludPublicaBackend.Services.ActividadUsuarioService
{
  public class ActividadUsuarioService : IActividadUsuarioService
  {
    private readonly IActividadUsuarioRepository _actividadRepository;
    private readonly IActividadUsuarioValidator _validator;
    private readonly IMapper _mapper;

    public ActividadUsuarioService(
      IActividadUsuarioRepository actividadRepository,
      IActividadUsuarioValidator validator,
      IMapper mapper)
    {
      _actividadRepository = actividadRepository;
      _validator = validator;
      _mapper = mapper;
    }

    public async Task<IEnumerable<GetActividadUsuarioDto>> GetActividades()
    {
      var actividades = await _actividadRepository.GetAllAsync<GetActividadUsuarioDto>();
      _validator.IsActividadListValid(actividades);
      return actividades;
    }

    async Task<GetActividadUsuarioDto> IActividadUsuarioService.RegisterActividad(RegisterActividadUsuarioDto dto)
    {
      var entity = _mapper.Map<ActividadUsuario>(dto);

      // (Opcional) Asegurar coherencia si alguien envía datos inconsistentes:
      if (entity.fechaActividad == default)
        entity.fechaActividad = DateOnly.FromDateTime(entity.fechaInicioSesion);
      if (entity.hora == default)
        entity.hora = TimeOnly.FromDateTime(entity.fechaInicioSesion);

      var creado = await _actividadRepository.AddAsync(entity);
      return _mapper.Map<GetActividadUsuarioDto>(creado);
    }

    public async Task<IEnumerable<GetActividadUsuarioDto>> GetActividadesPorUsuario(int idUsuario)
      {
         var actividades = await _actividadRepository.GetByUsuarioAsync(idUsuario);
         return _mapper.Map<IEnumerable<GetActividadUsuarioDto>>(actividades);
      }

   }
}