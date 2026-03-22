using SaludPublicaBackend.Dtos.MotivosEDto;
using SaludPublicaBackend.Models;
using System.Collections.Generic;

namespace SaludPublicaBackend.Validators.MotivosEValidator
{
  public interface IMotivosEValidator
  {
    void ValidateRegister(RegisterMotivosEDto dto);
    void ValidateUpdate(UpdateMotivosEDto dto);
    void ValidateEntity(MotivoEgreso entity);
    void ValidateList(IEnumerable<MotivoEgreso> items);
  }
}
