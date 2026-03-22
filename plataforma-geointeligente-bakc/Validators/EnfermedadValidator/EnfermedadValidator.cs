using SaludPublicaBackend.Configurations.CustomHttpResponses;
using SaludPublicaBackend.Dtos.EnfermedadDto;

namespace SaludPublicaBackend.Validators.EnfermedadValidator
{
  public class EnfermedadValidator : IEnfermedadValidator
  {
    public bool IsEnfermedadListValid(IEnumerable<GetEnfermedadDto>? enfermedades)
    {
      if (enfermedades == null || !enfermedades.Any())
        throw new NoContentException("No se encontraron enfermedades.");
      return true;
    }

    public void ValidateCreate(RegisterEnfermedadDto dto)
    {
      if (dto is null)
        throw new BadRequestException("Solicitud inválida.");
      if (string.IsNullOrWhiteSpace(dto.codigoICD))
        throw new BadRequestException("El campo 'codigoICD' es requerido.");
      if (dto.codigoICD.Length > 20)
        throw new BadRequestException("El 'codigoICD' excede la longitud permitida.");
      if (dto.nombreEnfermedad?.Length > 200)
        throw new BadRequestException("El 'nombreEnfermedad' excede la longitud permitida.");
      if (dto.descripcion?.Length > 500)
        throw new BadRequestException("La 'descripcion' excede la longitud permitida.");
    }

    public void ValidateNotDuplicateByCodigoICD(bool exists)
    {
      if (exists)
        throw new BadRequestException("El código ICD ya existe.");
    }
  }
}
