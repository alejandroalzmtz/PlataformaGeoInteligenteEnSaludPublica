using Microsoft.AspNetCore.Mvc;
using SaludPublicaBackend.Dtos.EstadosDto;
using SaludPublicaBackend.Services.EstadoService;

namespace SaludPublicaBackend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class EstadoController : ControllerBase
  {
    private readonly IEstadoService _estadoService;

    public EstadoController(IEstadoService estadoService)
    {
      _estadoService = estadoService;
    }
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<GetEstadosDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<GetEstadosDto>>> GetAll()
    {
      var result = await _estadoService.GetEstadosAsync();
      return Ok(result);
    }

    [HttpGet("GetEstadosPaged")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(typeof(PagedEstadosDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedEstadosDto>> GetEstadosPaged([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 50, [FromQuery] string? search = null)
    {
      var result = await _estadoService.GetEstadosPagedAsync(pageNumber, pageSize, search);
      return Ok(result);
    }

    [HttpPost("RegisterEstado")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(typeof(GetEstadosDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<GetEstadosDto>> RegisterEstado([FromBody] RegisterEstadoDto dto)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var created = await _estadoService.RegisterEstadoAsync(dto);
      return CreatedAtAction(nameof(GetEstado), new { id = created.idEstado }, created);
    }

    [HttpPut("UpdateEstado/{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(typeof(GetEstadosDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<GetEstadosDto>> UpdateEstado(int id, [FromBody] UpdateEstadoDto dto)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var updated = await _estadoService.UpdateEstadoAsync(id, dto);
      if (updated == null)
        return NotFound();

      return Ok(updated);
    }

    [HttpGet("GetEstado/{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(typeof(GetEstadosDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<GetEstadosDto>> GetEstado(int id)
    {
      var estado = await _estadoService.GetEstadoByIdAsync(id);
      if (estado == null)
        return NotFound();

      return Ok(estado);
    }


    [HttpPut("DesactivarEstado/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DesactivarEstado(int id)
    {
      var desactivado = await _estadoService.DesactivarEstadoAsync(id);
      if (!desactivado)
        return NotFound();

      return NoContent();
    }
  }
}
