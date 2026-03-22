using SaludPublicaBackend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SaludPublicaBackend.Repositories.PoblacionEstadoRepository
{
    public interface IPoblacionEstadoRepository
    {
        Task<IEnumerable<PoblacionEstado>> GetAllAsync();
        Task<PoblacionEstado?> GetByKeyAsync(int idEstado, int anio);
        Task<IEnumerable<PoblacionEstado>> GetByEstadoAsync(int idEstado);
        Task<PoblacionEstado> AddAsync(PoblacionEstado poblacionEstado);
        Task<PoblacionEstado> UpdateAsync(PoblacionEstado poblacionEstado);
        Task<bool> DeleteAsync(int idEstado, int anio);
    }
}