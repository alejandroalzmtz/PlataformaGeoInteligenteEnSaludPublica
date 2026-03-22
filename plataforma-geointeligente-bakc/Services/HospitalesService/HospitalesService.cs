using AutoMapper;
using SaludPublicaBackend.Dtos.HospitalesDto;
using SaludPublicaBackend.Repositories.HospitalesRepository;
using SaludPublicaBackend.Validators.HospitalesValidator;

namespace SaludPublicaBackend.Services.HospitalesService
{
  public class HospitalesService : IHospitalesService
  {
    private readonly IHospitalesRepository _repository;
    private readonly IHospitalesValidator _validator;
    private readonly IMapper _mapper;

    public HospitalesService(
      IHospitalesRepository repository,
      IHospitalesValidator validator,
      IMapper mapper)
    {
      _repository = repository;
      _validator  = validator;
      _mapper     = mapper;
    }

    public async Task<IEnumerable<GetHospitalesDto>> GetHospitalesAsync()
    {
      var entidades = await _repository.GetAllAsync();
      _validator.ValidateCollection(entidades);
      return _mapper.Map<IEnumerable<GetHospitalesDto>>(entidades);
    }

        public async Task<PagedHospitalesDto> GetHospitalesPagedAsync(
      int page,
      int pageSize,
      int? estado = null,
      int? municipio = null,
      int? localidad = null,
      string? search = null
    )
        {
            _validator.ValidatePagination(page, pageSize);

            var (items, total) = await _repository.GetPagedAsync(page, pageSize, estado, municipio, localidad, search);
            _validator.ValidateCollection(items);

            var dtoItems = _mapper.Map<IEnumerable<GetHospitalesDto>>(items);

            var totalPages = (int)Math.Ceiling(total / (double)pageSize);

            return new PagedHospitalesDto
            {
                Page = page,
                PageSize = pageSize,
                TotalItems = total,
                TotalPages = totalPages,
                Items = dtoItems
            };
        }
    }
}
