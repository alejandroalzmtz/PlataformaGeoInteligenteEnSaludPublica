using SaludPublicaBackend.Dtos.HospitalesDto;

namespace SaludPublicaBackend.Services.HospitalesService
{
    public interface IHospitalesService
    {
        Task<IEnumerable<GetHospitalesDto>> GetHospitalesAsync();

        Task<PagedHospitalesDto> GetHospitalesPagedAsync(
          int page,
          int pageSize,
          int? estado = null,
          int? municipio = null,
          int? localidad = null,
          string? search = null
        );
    }
}