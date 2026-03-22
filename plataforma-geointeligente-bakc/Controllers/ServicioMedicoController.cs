using Microsoft.AspNetCore.Mvc;
using SaludPublicaBackend.Dtos.ServicioMedicoDto;
using SaludPublicaBackend.Services.ServicioMedicoService;

namespace SaludPublicaBackend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class ServicioMedicoController : ControllerBase
  {
    private readonly IServicioMedicoService _service;

    public ServicioMedicoController(IServicioMedicoService service)
    {
      _service = service;
    }

    // MISMO EP, AHORA PAGINADO + SEARCH
    [HttpGet]
    [ProducesResponseType(typeof(PagedServicioMedicoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedServicioMedicoDto>> GetServicios(
      [FromQuery] int pageNumber = 1,
      [FromQuery] int pageSize   = 50,
      [FromQuery] string? search = null)
    {
      try
      {
        var result = await _service.GetServiciosAsync(pageNumber, pageSize, search);
        return Ok(result);
      }
      catch (ArgumentException ex)
      {
        return BadRequest(ex.Message);
      }
    }

    [HttpGet("{idServicio}")]
    [ProducesResponseType(typeof(GetServicioMedicoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GetServicioMedicoDto>> GetServicio(int idServicio)
    {
      var item = await _service.GetByIdAsync(idServicio);
      if (item == null) return NotFound();
      return Ok(item);
    }

    [HttpPost("RegisterServicioMedico")]
    [ProducesResponseType(typeof(GetServicioMedicoDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<GetServicioMedicoDto>> RegisterServicioMedico([FromBody] RegisterServicioMedicoDto dto)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var created = await _service.RegisterAsync(dto);
      return CreatedAtAction(nameof(GetServicio), new { idServicio = created.idServicio }, created);
    }

    [HttpPut("UpdateServicioMedico/{idServicio}")]
    [ProducesResponseType(typeof(GetServicioMedicoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GetServicioMedicoDto>> UpdateServicioMedico(int idServicio, [FromBody] UpdateServicioMedicoDto dto)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var updated = await _service.UpdateAsync(idServicio, dto);
      if (updated == null) return NotFound();

      return Ok(updated);
    }

    [HttpDelete("DeleteServicioMedico/{idServicio}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteServicioMedico(int idServicio)
    {
      var deleted = await _service.DeleteAsync(idServicio);
      if (!deleted) return NotFound();
      return NoContent();
    }
  }
}
