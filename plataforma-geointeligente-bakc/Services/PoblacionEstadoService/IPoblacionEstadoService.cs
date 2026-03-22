using SaludPublicaBackend.Dtos.PoblacionEstadoDto;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SaludPublicaBackend.Services.PoblacionEstadoService
{
    public interface IPoblacionEstadoService
    {
        Task<IEnumerable<GetPoblacionEstadoDto>> GetAllAsync();
        Task<GetPoblacionEstadoDto?> GetByKeyAsync(int idEstado, int anio);
        Task<IEnumerable<GetPoblacionEstadoDto>> GetByEstadoAsync(int idEstado);
        Task<GetPoblacionEstadoDto> CreateAsync(CreatePoblacionEstadoDto dto);
        Task<GetPoblacionEstadoDto> UpdateAsync(UpdatePoblacionEstadoDto dto);
        Task<bool> DeleteAsync(int idEstado, int anio);
    }
}