using SaludPublicaBackend.Dtos.RegistroMedicoDto;
using System;
using System.Collections.Generic;
using System.Linq;

namespace SaludPublicaBackend.Validators.RegistroMedicoValidators
{
  public class RegistroMedicoValidator : IRegistroMedicoValidator
  {
    public bool IsRegistroListValid(IEnumerable<GetRegistroMedicoDto>? registros)
    {
      if (registros == null)
        throw new ArgumentNullException(nameof(registros), "La lista de registros es nula.");

      var duplicados = registros
        .GroupBy(r => r.idRegistro)
        .Where(g => g.Count() > 1)
        .Select(g => g.Key)
        .ToList();

      if (duplicados.Any())
        throw new InvalidOperationException("Existen registros duplicados en la lista de resultados.");

      return true;
    }

    /// <summary>
    /// Valida que no exista un registro duplicado según una comprobación previa.
    /// </summary>
    /// <param name="registroExist">Resultado de una consulta que determina si ya existe.</param>
    public void ValidateNotDuplicateAsync(bool registroExist)
    {
      if (registroExist)
        throw new ArgumentException("Ya existe un registro con los mismos datos.");
    }
  }
}