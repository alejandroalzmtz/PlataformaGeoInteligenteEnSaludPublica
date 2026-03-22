using SaludPublicaBackend.Dtos.ActividadUsuarioDto;
using System;
using System.Collections.Generic;
using System.Linq;

namespace SaludPublicaBackend.Validators.ActividadUsuarioValidators
{
  public class ActividadUsuarioValidator : IActividadUsuarioValidator
  {
    public bool IsActividadListValid(IEnumerable<GetActividadUsuarioDto>? actividades)
    {
      if (actividades == null)
        throw new ArgumentNullException(nameof(actividades), "La lista de actividades es nula.");

      var duplicados = actividades
        .GroupBy(a => a.idActividad)
        .Where(g => g.Count() > 1)
        .Select(g => g.Key)
        .ToList();

      if (duplicados.Any())
        throw new InvalidOperationException("Existen actividades duplicadas en el resultado.");

      return true;
    }
  }
}