using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SaludPublicaBackend.Dtos.MotivosEDto;
using SaludPublicaBackend.Services.MotivosEService;

namespace SaludPublicaBackend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class MotivosEController : ControllerBase
  {
    private readonly IMotivosEService _service;

    public MotivosEController(IMotivosEService service)
    {
      _service = service;
    }

    [HttpGet("GetMotivosEgresoPaged")]
    [ProducesResponseType(typeof(PagedMotivosEDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PagedMotivosEDto>> GetMotivosEgresoPaged(
      [FromQuery] int pageNumber = 1,
      [FromQuery] int pageSize = 50,
      [FromQuery] string? search = null)
    {
      try
      {
        var result = await _service.GetPagedAsync(pageNumber, pageSize, search);
        return Ok(result);
      }
      catch (ArgumentException ex)
      {
        return BadRequest(ex.Message);
      }
    }

    [HttpGet("{idMotivoEgreso}")]
    [ProducesResponseType(typeof(GetMotivosEDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GetMotivosEDto>> GetMotivoEgreso(int idMotivoEgreso)
    {
      var item = await _service.GetByIdAsync(idMotivoEgreso);
      if (item == null) return NotFound();
      return Ok(item);
    }

    [HttpPost("RegisterMotivoEgreso")]
    [ProducesResponseType(typeof(GetMotivosEDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetMotivosEDto>> RegisterMotivoEgreso([FromBody] RegisterMotivosEDto dto)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      try
      {
        var created = await _service.RegisterAsync(dto);
        return CreatedAtAction(nameof(GetMotivoEgreso), new { idMotivoEgreso = created.idMotivoEgreso }, created);
      }
      catch (DbUpdateException ex)
      {
        // Aquí verás el mensaje REAL de SQL Server en la respuesta
        return StatusCode(StatusCodes.Status500InternalServerError,
          $"Error de base de datos al registrar MotivoEgreso: {ex.InnerException?.Message ?? ex.Message}");
      }
      catch (Exception ex)
      {
        // Por ejemplo, duplicado (“El motivo de egreso ya existe.”)
        return BadRequest(ex.Message);
      }
    }

    [HttpPut("UpdateMotivoEgreso/{idMotivoEgreso}")]
    [ProducesResponseType(typeof(GetMotivosEDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GetMotivosEDto>> UpdateMotivoEgreso(int idMotivoEgreso, [FromBody] UpdateMotivosEDto dto)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var updated = await _service.UpdateAsync(idMotivoEgreso, dto);
      if (updated == null) return NotFound();

      return Ok(updated);
    }

    [HttpDelete("DeleteMotivoEgreso/{idMotivoEgreso}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMotivoEgreso(int idMotivoEgreso)
    {
      var deleted = await _service.DeleteAsync(idMotivoEgreso);
      if (!deleted) return NotFound();
      return NoContent();
    }
  }
}
