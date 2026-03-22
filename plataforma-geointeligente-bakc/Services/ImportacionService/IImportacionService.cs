using System.Threading;

namespace SaludPublicaBackend.Services.ImportacionService
{
  public interface IImportacionService
  {
    Task<(int inserted, int skipped, string cleanedFilePath, string transformedFilePath, string? pythonSummary)> ImportRegistroMedicoWithCleaningAsync(
      Stream uploadedCsv, string originalFileName, CancellationToken cancellationToken);
  }
}
