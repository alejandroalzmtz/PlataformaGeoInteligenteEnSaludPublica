using SaludPublicaBackend.Dtos.ProcedenciaDto;
using SaludPublicaBackend.Models;
using System.Collections.Generic;

namespace SaludPublicaBackend.Validators.ProcedenciaValidator
{
  public interface IProcedenciaValidator
  {
    void ValidateList(IEnumerable<Procedencia> procedencias);
    void ValidateRegister(RegisterProcedenciaDto dto);
    void ValidateUpdate(UpdateProcedenciaDto dto);
    void ValidateEntity(Procedencia procedencia);
  }
}
