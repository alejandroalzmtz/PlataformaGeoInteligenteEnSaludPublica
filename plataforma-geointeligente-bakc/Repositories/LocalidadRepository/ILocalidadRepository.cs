using SaludPublicaBackend.Dtos.LocalidadDto;
using SaludPublicaBackend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SaludPublicaBackend.Repositories.LocalidadRepository
{
  public interface ILocalidadRepository
  {
    Task<(IReadOnlyList<GetLocalidadDto> items, int totalCount)> GetPagedAsync(int pageNumber, int pageSize, int idEdo, int idMpo, string? search);
    Task<Localidad?> GetByIdAsync(int idLoc);
    Task<Localidad> AddAsync(Localidad localidad);
    Task UpdateAsync(Localidad localidad);
    Task DeleteAsync(Localidad localidad);
  }
}
