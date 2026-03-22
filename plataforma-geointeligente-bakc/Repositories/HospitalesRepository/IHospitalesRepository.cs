using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Repositories.HospitalesRepository
{
    public interface IHospitalesRepository
    {
        Task<List<Hospitales>> GetAllAsync();

        Task<(List<Hospitales> Items, int TotalCount)> GetPagedAsync(
          int page,
          int pageSize,
          int? estado = null,
          int? municipio = null,
          int? localidad = null,
          string? search = null
        );
    }
}