using SaludPublicaBackend.Dtos.PoblacionEstadoAnualDto;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SaludPublicaBackend.Services.PoblacionEstadoAnualService
{
    public interface IPoblacionEstadoAnualService
    {
        Task<IEnumerable<GetPoblacionEstadoAnualDto>> GetAllAsync();
        Task<GetPoblacionEstadoAnualDto?> GetByKeyAsync(int idEstado, int anio);
        Task<IEnumerable<GetPoblacionEstadoAnualDto>> GetByEstadoAsync(int idEstado);
        Task<GetPoblacionEstadoAnualDto> CreateAsync(CreatePoblacionEstadoAnualDto dto);
        Task<GetPoblacionEstadoAnualDto> UpdateAsync(UpdatePoblacionEstadoAnualDto dto);
        Task<bool> DeleteAsync(int idEstado, int anio);
    }
}
