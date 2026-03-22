using System.Data;

namespace SaludPublicaBackend.Repositories.ImportacionRepository
{
  public interface IImportacionRepository
  {
    // Importación masiva desde un stream CSV hacia la tabla de RegistroMedico
    Task<(int inserted, int skipped)> ImportRegistroMedicoCsvAsync(Stream csvStream, CancellationToken cancellationToken);
  }
}
