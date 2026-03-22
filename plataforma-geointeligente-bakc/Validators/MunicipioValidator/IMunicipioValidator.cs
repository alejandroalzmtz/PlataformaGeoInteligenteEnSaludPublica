using SaludPublicaBackend.Dtos.MunicipioDto;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Validators.MunicipioValidator
{
  public interface IMunicipioValidator
  {
    void ValidateRegister(RegisterMunicipioDto dto);
    void ValidateUpdate(UpdateMunicipioDto dto);
    void ValidateEntity(Municipio municipio);
  }
}
