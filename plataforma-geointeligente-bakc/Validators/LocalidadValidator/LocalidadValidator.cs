using SaludPublicaBackend.Dtos.LocalidadDto;
using SaludPublicaBackend.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace SaludPublicaBackend.Validators.LocalidadValidator
{
  public class LocalidadValidator : ILocalidadValidator
  {
    public void ValidateRegister(RegisterLocalidadDto dto)
    {
      if (dto.idEdo <= 0) throw new ArgumentException("idEdo debe ser mayor que 0.");
      if (dto.idMpo <= 0) throw new ArgumentException("idMpo debe ser mayor que 0.");
      if (string.IsNullOrWhiteSpace(dto.nombreLocalidad))
        throw new ArgumentException("nombreLocalidad es obligatorio.");
    }

    public void ValidateUpdate(UpdateLocalidadDto dto)
    {
      if (dto.nombreLocalidad != null && string.IsNullOrWhiteSpace(dto.nombreLocalidad))
        throw new ArgumentException("nombreLocalidad no puede ser vacío.");
    }

    public void ValidateEntity(Localidad localidad)
    {
      if (localidad.idEdo <= 0 || localidad.idMpo <= 0)
        throw new ArgumentException("idEdo e idMpo deben ser mayores que 0.");
    }

    public void ValidateList(IEnumerable<Localidad> localidades)
    {
      if (localidades == null)
        throw new ArgumentException("La lista de localidades no puede ser nula.");

      if (!localidades.Any())
        return; // lista vacía es válida en un get

      foreach (var loc in localidades)
      {
        ValidateEntity(loc);
      }
    }
  }
}
