using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using SaludPublicaBackend.Configurations.CustomHttpResponses;
using SaludPublicaBackend.Services.ImportacionService;

namespace SaludPublicaBackend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class ImportacionController : ControllerBase
  {
    private readonly IImportacionService _importacionService;

    public ImportacionController(IImportacionService importacionService)
    {
      _importacionService = importacionService;
    }

    [HttpPost("ImportRegistroMedicoCsv")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(1_000_000_000)]
    [RequestFormLimits(MultipartBodyLengthLimit = 1_000_000_000)]
    [ProducesResponseType(typeof(ImportResultResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ImportResultResponse>> ImportRegistroMedicoCsv(IFormFile file)
    {
      if (file == null || file.Length == 0)
        return BadRequest(new ErrorMessage { Message = "No se recibió ningún archivo o el archivo está vacío." });

      var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
      if (extension != ".csv")
        return BadRequest(new ErrorMessage { Message = "El archivo debe tener extensión .csv." });

      try
      {
        await using var stream = file.OpenReadStream();
        var (inserted, skipped, cleanedFile, transformedFile, pythonSummary) =
          await _importacionService.ImportRegistroMedicoWithCleaningAsync(stream, file.FileName, HttpContext.RequestAborted);

        var details = string.IsNullOrWhiteSpace(pythonSummary) ? "" : $" Detalles: {pythonSummary}.";
        var msg = $"Importación finalizada. Limpio: {cleanedFile}. Transformado: {transformedFile}.{details}";

        return Ok(new ImportResultResponse(
          message: msg,
          inserted: inserted,
          skipped: skipped,
          log: pythonSummary ?? string.Empty
        ));
      }
      catch (OperationCanceledException)
      {
        return BadRequest(new ErrorMessage { Message = "La importación fue cancelada." });
      }
      catch (InvalidOperationException ex)
      {
        var detail = ex.InnerException?.Message;
        var msg = string.IsNullOrWhiteSpace(detail) ? ex.Message : $"{ex.Message} Detalle: {detail}";
        return BadRequest(new ErrorMessage { Message = msg });
      }
      catch (Exception ex)
      {
        return StatusCode(StatusCodes.Status500InternalServerError,
          new ErrorMessage { Message = $"Error en la importación: {ex.Message}" });
      }
    }
  }

  public record UploadCsvResponse(string message, string originalFileName, string contentType, long size, string tempPath);
  public record ImportResultResponse(string message, int inserted, int skipped, string log);
}
