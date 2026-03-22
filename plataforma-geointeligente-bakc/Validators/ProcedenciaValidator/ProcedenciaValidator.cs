using SaludPublicaBackend.Dtos.ProcedenciaDto;
using SaludPublicaBackend.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace SaludPublicaBackend.Validators.ProcedenciaValidator
{
  public class ProcedenciaValidator : IProcedenciaValidator
  {
    public void ValidateList(IEnumerable<Procedencia> procedencias)
    {
      if (procedencias == null)
        throw new ArgumentException("La lista de procedencias no puede ser nula.");
    }

    public void ValidateRegister(RegisterProcedenciaDto dto)
    {
      if (string.IsNullOrWhiteSpace(dto.descripcion))
        throw new ArgumentException("descripcion es obligatoria.");
    }

    public void ValidateUpdate(UpdateProcedenciaDto dto)
    {
      if (dto.descripcion != null && string.IsNullOrWhiteSpace(dto.descripcion))
        throw new ArgumentException("descripcion no puede ser vacía.");
    }

    public void ValidateEntity(Procedencia procedencia)
    {
      if (string.IsNullOrWhiteSpace(procedencia.descripcion))
        throw new ArgumentException("descripcion es obligatoria.");
    }
  }
}
