using SaludPublicaBackend.Dtos.MunicipioDto;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Repositories.MunicipioRepository
{
  public interface IMunicipioRepository
  {
    Task<(IReadOnlyList<GetMunicipioDto> items, int totalCount)> GetPagedAsync(int pageNumber, int pageSize, int idEstado, string? search);
    Task<Municipio?> GetByIdAsync(int idMunicipio);
    Task<Municipio> AddAsync(Municipio municipio);
    Task UpdateAsync(Municipio municipio);
    Task DeleteAsync(Municipio municipio);
    Task<bool> ExistsByIdMpoAsync(int idMpo);
  }
}
