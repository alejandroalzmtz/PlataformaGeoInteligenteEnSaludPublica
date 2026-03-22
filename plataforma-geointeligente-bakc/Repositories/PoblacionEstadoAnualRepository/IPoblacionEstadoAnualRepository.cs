using SaludPublicaBackend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SaludPublicaBackend.Repositories.PoblacionEstadoAnualRepository
{
    public interface IPoblacionEstadoAnualRepository
    {
        Task<IEnumerable<PoblacionEstadoAnual>> GetAllAsync();
        Task<PoblacionEstadoAnual?> GetByKeyAsync(int idEstado, int anio);
        Task<IEnumerable<PoblacionEstadoAnual>> GetByEstadoAsync(int idEstado);
        Task<PoblacionEstadoAnual> AddAsync(PoblacionEstadoAnual entity);
        Task<PoblacionEstadoAnual> UpdateAsync(PoblacionEstadoAnual entity);
        Task<bool> DeleteAsync(int idEstado, int anio);
    }
}
