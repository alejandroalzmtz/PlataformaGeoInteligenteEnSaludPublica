using AutoMapper;
using System.Collections.Generic;
using System.Threading.Tasks;
using SaludPublicaBackend.Dtos.RangoEdadDto;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.RangoEdadRepository;
using SaludPublicaBackend.Validators.RangoEdadValidator;

namespace SaludPublicaBackend.Services.RangoEdadService
{
  public class RangoEdadService : IRangoEdadService
  {
    private readonly IRangoEdadRepository _rangoEdadRepository;
    private readonly IRangoEdadValidator _rangoEdadValidator;
    private readonly IMapper _mapper;

    public RangoEdadService(
        IRangoEdadRepository rangoEdadRepository,
        IRangoEdadValidator rangoEdadValidator,
        IMapper mapper)
    {
      _rangoEdadRepository = rangoEdadRepository;
      _rangoEdadValidator = rangoEdadValidator;
      _mapper = mapper;
    }

    public async Task<IEnumerable<GetRangoEdadDto>> GetRangosEdad()
    {
      var rangos = await _rangoEdadRepository.GetAllAsync<GetRangoEdadDto>();
      _rangoEdadValidator.IsRangoEdadListValid(rangos);
      return rangos;
    }

    public async Task<GetRangoEdadDto> RegisterRangoEdad(RegisterRangoEdadDto dto)
    {
      var exists = await _rangoEdadRepository.ExistsByNombreRangoEdadAsync(dto.RangoInicial, dto.RangoFinal);
      if (exists)
        throw new System.Exception("El rango de edad ya existe.");

      var entity = _mapper.Map<RangoEdad>(dto);
      var created = await _rangoEdadRepository.AddAsync(entity);
      return _mapper.Map<GetRangoEdadDto>(created);
    }
  }
}
