using SaludPublicaBackend.Dtos.EnfermedadDto;

namespace SaludPublicaBackend.Services.EnfermedadService
{
  public interface IEnfermedadService
  {
    Task<IEnumerable<GetEnfermedadDto>> GetEnfermedades();
    Task<GetEnfermedadDto> RegisterEnfermedad(RegisterEnfermedadDto dto);
    Task<GetEnfermedadDto> UpdateEnfermedad(string idEnfermedad, UpdateEnfermedadDto dto);
    Task DeleteEnfermedad(string idEnfermedad);
    Task DesactivarEnfermedad(string idEnfermedad);
  }
}