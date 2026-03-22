using SaludPublicaBackend.Dtos.MunicipioDto;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Validators.MunicipioValidator
{
  public class MunicipioValidator : IMunicipioValidator
  {
    public void ValidateRegister(RegisterMunicipioDto dto)
    {
      if (dto.idEstado <= 0)
        throw new ArgumentException("idEstado debe ser mayor que 0.");

      if (string.IsNullOrWhiteSpace(dto.nombreMunicipio))
        throw new ArgumentException("nombreMunicipio es obligatorio.");
    }

    public void ValidateUpdate(UpdateMunicipioDto dto)
    {
      if (dto.nombreMunicipio != null && string.IsNullOrWhiteSpace(dto.nombreMunicipio))
        throw new ArgumentException("nombreMunicipio no puede ser vacío.");
    }

    public void ValidateEntity(Municipio municipio)
    {
      if (municipio.idEstado <= 0)
        throw new ArgumentException("idEstado debe ser mayor que 0.");

      // OJO: ya no exigimos idMpo > 0 aquí,
      // porque se asigna en el repositorio antes de guardar.
    }
  }
}