using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Validators.HospitalesValidator
{
  public interface IHospitalesValidator
  {
    void ValidateCollection(IEnumerable<Hospitales> hospitales);
    void ValidatePagination(int page, int pageSize);
  }
}