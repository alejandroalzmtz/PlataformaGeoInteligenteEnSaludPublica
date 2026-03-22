using SaludPublicaBackend.Dtos.DerechoHabDto;
using SaludPublicaBackend.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace SaludPublicaBackend.Validators.DerechoHabValidator
{
  public class DerechoHabValidator : IDerechoHabValidator
  {
    public void ValidateRegister(RegisterDerechoHabDto dto)
    {
      if (string.IsNullOrWhiteSpace(dto.descripcion))
        throw new ArgumentException("descripcion es obligatoria.");
    }

    public void ValidateUpdate(UpdateDerechoHabDto dto)
    {
      if (dto.descripcion != null && string.IsNullOrWhiteSpace(dto.descripcion))
        throw new ArgumentException("descripcion no puede ser vacía.");
    }

    public void ValidateEntity(DerechoHabitacion entity)
    {
      if (string.IsNullOrWhiteSpace(entity.descripcion))
        throw new ArgumentException("descripcion es obligatoria.");
    }

    public void ValidateList(IEnumerable<DerechoHabitacion> items)
    {
      if (items == null)
        throw new ArgumentException("La lista no puede ser nula.");

      if (!items.Any()) return;

      foreach (var d in items)
        ValidateEntity(d);
    }
  }
}
