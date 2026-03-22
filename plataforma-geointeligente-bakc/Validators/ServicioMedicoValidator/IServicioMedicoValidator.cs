using SaludPublicaBackend.Dtos.ServicioMedicoDto;
using SaludPublicaBackend.Models;
using System.Collections.Generic;

namespace SaludPublicaBackend.Validators.ServicioMedicoValidator
{
  public interface IServicioMedicoValidator
  {
    void ValidateList(IEnumerable<ServicioMedico> servicios);
    void ValidateRegister(RegisterServicioMedicoDto dto);
    void ValidateUpdate(UpdateServicioMedicoDto dto);
    void ValidateEntity(ServicioMedico servicio);
  }
}
