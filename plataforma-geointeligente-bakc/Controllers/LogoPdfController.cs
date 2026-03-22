using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaludPublicaBackend.Configurations.CustomHttpResponses;
using SaludPublicaBackend.Dtos.LogoPdfDto;
using SaludPublicaBackend.Services.LogoPdfService;

namespace SaludPublicaBackend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  [Authorize]
  public class LogoPdfController : ControllerBase
  {
    private readonly ILogoPdfService _logoPdfService;

    public LogoPdfController(ILogoPdfService logoPdfService)
    {
      _logoPdfService = logoPdfService;
    }

    // ────────────────── helpers ──────────────────

    private static string GetContentType(string formato) =>
      formato.Equals("PNG", StringComparison.OrdinalIgnoreCase) ? "image/png" : "image/jpeg";

    // ────────────────── endpoints ──────────────────

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<GetLogoPdfDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<GetLogoPdfDto>>> GetAll()
    {
      var logos = await _logoPdfService.GetAllAsync();
      return Ok(logos);
    }

    [HttpGet("activo")]
    [ProducesResponseType(typeof(GetLogoPdfDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetLogoPdfDto>> GetActivo()
    {
      var logoActivo = await _logoPdfService.GetActivoAsync();
      return Ok(logoActivo);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(GetLogoPdfDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetLogoPdfDto>> GetById(int id)
    {
      var logo = await _logoPdfService.GetByIdAsync(id);
      return Ok(logo);
    }

    [HttpGet("{id}/imagen")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetImagen(int id)
    {
      var result = await _logoPdfService.GetImagenAsync(id);
      return File(result.ImagenData, GetContentType(result.Formato));
    }

    [HttpGet("activo/imagen")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetImagenActivo()
    {
      var result = await _logoPdfService.GetImagenActivoAsync();
      return File(result.ImagenData, GetContentType(result.Formato));
    }

    [HttpGet("activo/dataurl")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetActivoDataUrl()
    {
      var result = await _logoPdfService.GetActivoDataUrlAsync();
      return Ok(new { dataUrl = result.DataUrl, format = result.Formato });
    }

    [HttpPost]
    [Authorize(Roles = "1")]
    [RequestSizeLimit(30 * 1024 * 1024)]
    [ProducesResponseType(typeof(GetLogoPdfDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetLogoPdfDto>> Create(IFormFile imagen)
    {
      var creado = await _logoPdfService.CreateAsync(imagen);
      return CreatedAtAction(nameof(GetById), new { id = creado.IdLogo }, creado);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "1")]
    [RequestSizeLimit(30 * 1024 * 1024)]
    [ProducesResponseType(typeof(GetLogoPdfDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetLogoPdfDto>> Update(int id, IFormFile imagen)
    {
      var updated = await _logoPdfService.UpdateAsync(id, imagen);
      return Ok(updated);
    }

    [HttpPost("{id}/activar")]
    [Authorize(Roles = "1")]
    [ProducesResponseType(typeof(GetLogoPdfDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetLogoPdfDto>> SetActivo(int id)
    {
      var logo = await _logoPdfService.SetActivoAsync(id);
      return Ok(logo);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "1")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Delete(int id)
    {
      await _logoPdfService.DeleteAsync(id);
      return NoContent();
    }

    [HttpDelete("all")]
    [Authorize(Roles = "1")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteAll()
    {
      await _logoPdfService.DeleteAllAsync();
      return NoContent();
    }
  }
}
