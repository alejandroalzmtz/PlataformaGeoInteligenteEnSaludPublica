using SaludPublicaBackend.Dtos.EnfermedadDto;

namespace SaludPublicaBackend.Validators.EnfermedadValidator
{
  public interface IEnfermedadValidator
  {
    bool IsEnfermedadListValid(IEnumerable<GetEnfermedadDto>? enfermedades);
    void ValidateCreate(RegisterEnfermedadDto dto);
    void ValidateNotDuplicateByCodigoICD(bool exists);
  }
}
