using SaludPublicaBackend.Dtos.LocalidadDto;
using SaludPublicaBackend.Models;
using System.Collections.Generic;

namespace SaludPublicaBackend.Validators.LocalidadValidator
{
  public interface ILocalidadValidator
  {
    void ValidateRegister(RegisterLocalidadDto dto);
    void ValidateUpdate(UpdateLocalidadDto dto);
    void ValidateEntity(Localidad localidad);

    // ✅ agregar para que coincida con el uso en el servicio
    void ValidateList(IEnumerable<Localidad> localidades);
  }
}
