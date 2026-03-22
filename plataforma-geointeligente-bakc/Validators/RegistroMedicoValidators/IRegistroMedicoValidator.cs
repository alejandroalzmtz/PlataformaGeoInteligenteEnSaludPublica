using System.Collections.Generic;
using SaludPublicaBackend.Dtos.RegistroMedicoDto;

namespace SaludPublicaBackend.Validators.RegistroMedicoValidators
{
  public interface IRegistroMedicoValidator
  {
    bool IsRegistroListValid(IEnumerable<GetRegistroMedicoDto>? registros);
    void ValidateNotDuplicateAsync(bool registroExist);
  }
}