using SaludPublicaBackend.Dtos.ServicioMedicoDto;
using SaludPublicaBackend.Models;
using System;
using System.Collections.Generic;

namespace SaludPublicaBackend.Validators.ServicioMedicoValidator
{
  public class ServicioMedicoValidator : IServicioMedicoValidator
  {
    public void ValidateList(IEnumerable<ServicioMedico> servicios)
    {
      if (servicios == null)
        throw new ArgumentException("La lista de servicios médicos no puede ser nula.");
    }

    public void ValidateRegister(RegisterServicioMedicoDto dto)
    {
      if (string.IsNullOrWhiteSpace(dto.nombreServicio))
        throw new ArgumentException("nombreServicio es obligatorio.");
    }

    public void ValidateUpdate(UpdateServicioMedicoDto dto)
    {
      if (dto.nombreServicio != null && string.IsNullOrWhiteSpace(dto.nombreServicio))
        throw new ArgumentException("nombreServicio no puede ser vacío.");
    }

    public void ValidateEntity(ServicioMedico servicio)
    {
      if (string.IsNullOrWhiteSpace(servicio.nombreServicio))
        throw new ArgumentException("nombreServicio es obligatorio.");
    }
  }
}
