using SaludPublicaBackend.Dtos.DerechoHabDto;
using SaludPublicaBackend.Models;
using System.Collections.Generic;

namespace SaludPublicaBackend.Validators.DerechoHabValidator
{
  public interface IDerechoHabValidator
  {
    void ValidateRegister(RegisterDerechoHabDto dto);
    void ValidateUpdate(UpdateDerechoHabDto dto);
    void ValidateEntity(DerechoHabitacion entity);
    void ValidateList(IEnumerable<DerechoHabitacion> items);
  }
}
