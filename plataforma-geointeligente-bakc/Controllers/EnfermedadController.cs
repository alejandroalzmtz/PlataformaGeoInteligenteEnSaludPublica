using Microsoft.AspNetCore.Mvc;
using SaludPublicaBackend.Configurations.CustomHttpResponses;
using SaludPublicaBackend.Dtos.EnfermedadDto;
using SaludPublicaBackend.Services.EnfermedadService;
using System.Globalization;
using System.Linq;
using System.Text;

namespace SaludPublicaBackend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class EnfermedadController : ControllerBase
  {
    private readonly IEnfermedadService _enfermedadService;

    public EnfermedadController(IEnfermedadService enfermedadService)
    {
      _enfermedadService = enfermedadService;
    }

    // 1) GET paginado con search
    [HttpGet("GetEnfermedades")]
    [ProducesResponseType(typeof(PagedEnfermedadDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PagedEnfermedadDto>> GetEnfermedades(
      [FromQuery] int pageNumber = 1,
      [FromQuery] int pageSize = 50,
      [FromQuery] string? search = null)
    {
      const int maxPageSize = 200;
      if (pageNumber < 1) pageNumber = 1;
      if (pageSize < 1) pageSize = 50;
      if (pageSize > maxPageSize) pageSize = maxPageSize;

      // obtenemos toda la lista desde el service
      var listado = (await _enfermedadService.GetEnfermedades()).ToList();

      // filtro por search (nombre o código ICD), normalizando acentos y mayúsculas
      if (!string.IsNullOrWhiteSpace(search))
      {
        var term = search.Trim();
        var normTerm = NormalizeForSearch(term);
        listado = listado
          .Where(e =>
          {
            var nNombre = NormalizeForSearch(e.nombreEnfermedad);
            var nCodigo = NormalizeForSearch(e.codigoICD);
            return nNombre.Contains(normTerm) || nCodigo.Contains(normTerm);
          })
          .ToList();
      }

      var totalCount = listado.Count;
      var pagedItems = listado
        .Skip((pageNumber - 1) * pageSize)
        .Take(pageSize)
        .ToList();

      var dto = new PagedEnfermedadDto
      {
        Items = pagedItems,
        PageNumber = pageNumber,
        PageSize = pageSize,
        TotalCount = totalCount,
        Search = search
      };

      return Ok(dto);
    }

    // 2) REGISTER
    [HttpPost("RegisterEnfermedad")]
    [ProducesResponseType(typeof(GetEnfermedadDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegisterEnfermedad([FromBody] RegisterEnfermedadDto dto)
    {
      if (!ModelState.IsValid)
        return BadRequest(new ErrorMessage { Message = "Datos inválidos." });

      try
      {
        var creada = await _enfermedadService.RegisterEnfermedad(dto);
        // Podrías usar CreatedAtAction hacia un GetById cuando lo tengas; de momento Created simple:
        return Created(string.Empty, creada);
      }
      catch (ArgumentException ex)
      {
        return BadRequest(new ErrorMessage { Message = ex.Message });
      }
    }

    // 3) UPDATE por ID
    [HttpPut("UpdateEnfermedad/{idEnfermedad}")]
    [ProducesResponseType(typeof(GetEnfermedadDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateEnfermedad(
      [FromRoute] string idEnfermedad,
      [FromBody] UpdateEnfermedadDto dto)
    {
      if (!ModelState.IsValid)
        return BadRequest(new ErrorMessage { Message = "Datos inválidos." });

      try
      {
        var actualizada = await _enfermedadService.UpdateEnfermedad(idEnfermedad, dto);
        return Ok(actualizada);
      }
      catch (ArgumentException ex)
      {
        return BadRequest(new ErrorMessage { Message = ex.Message });
      }
      catch (KeyNotFoundException ex)
      {
        return NotFound(new ErrorMessage { Message = ex.Message });
      }
    }

    // 4) DESACTIVAR por ID (borrado lógico)
    [HttpDelete("DeleteEnfermedad/{idEnfermedad}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteEnfermedad([FromRoute] string idEnfermedad)
    {
      try
      {
        await _enfermedadService.DesactivarEnfermedad(idEnfermedad);
        return NoContent();
      }
      catch (ArgumentException ex)
      {
        return BadRequest(new ErrorMessage { Message = ex.Message });
      }
      catch (KeyNotFoundException ex)
      {
        return NotFound(new ErrorMessage { Message = ex.Message });
      }
    }

    // Normalización para búsquedas (acentos, mayúsculas)
    private static string NormalizeForSearch(string? input)
    {
      if (string.IsNullOrWhiteSpace(input)) return string.Empty;
      var formD = input.Normalize(NormalizationForm.FormD);
      var sb = new StringBuilder();
      foreach (var ch in formD)
      {
        var uc = CharUnicodeInfo.GetUnicodeCategory(ch);
        if (uc != UnicodeCategory.NonSpacingMark &&
            uc != UnicodeCategory.SpacingCombiningMark &&
            uc != UnicodeCategory.EnclosingMark)
        {
          sb.Append(char.ToLowerInvariant(ch));
        }
      }
      return sb.ToString().Normalize(NormalizationForm.FormC);
    }
  }
}
