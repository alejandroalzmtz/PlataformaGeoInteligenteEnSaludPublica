using SaludPublicaBackend.Dtos.MotivosEDto;
using SaludPublicaBackend.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace SaludPublicaBackend.Validators.MotivosEValidator
{
  public class MotivosEValidator : IMotivosEValidator
  {
    public void ValidateRegister(RegisterMotivosEDto dto)
    {
      if (string.IsNullOrWhiteSpace(dto.descripcion))
        throw new ArgumentException("descripcion es obligatoria.");
    }

    public void ValidateUpdate(UpdateMotivosEDto dto)
    {
      if (dto.descripcion != null && string.IsNullOrWhiteSpace(dto.descripcion))
        throw new ArgumentException("descripcion no puede ser vacía.");
    }

    public void ValidateEntity(MotivoEgreso entity)
    {
      if (string.IsNullOrWhiteSpace(entity.descripcion))
        throw new ArgumentException("descripcion es obligatoria.");
    }

    public void ValidateList(IEnumerable<MotivoEgreso> items)
    {
      if (items == null)
        throw new ArgumentException("La lista no puede ser nula.");

      if (!items.Any()) return;

      foreach (var m in items)
        ValidateEntity(m);
    }
  }
}
