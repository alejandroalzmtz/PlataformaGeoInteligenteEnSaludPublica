using Microsoft.AspNetCore.Mvc;
using SaludPublicaBackend.Dtos.LocalidadDto;
using SaludPublicaBackend.Services.LocalidadService;

namespace SaludPublicaBackend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class LocalidadController : ControllerBase
  {
    private readonly ILocalidadService _localidadService;

    public LocalidadController(ILocalidadService localidadService)
    {
      _localidadService = localidadService;
    }

    [HttpGet("GetLocalidadesPaged")]
    [ProducesResponseType(typeof(PagedLocalidadDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PagedLocalidadDto>> GetLocalidadesPaged(
      [FromQuery] int pageNumber = 1,
      [FromQuery] int pageSize = 50,
      [FromQuery] int idEdo = 0,
      [FromQuery] int idMpo = 0,
      [FromQuery] string? search = null)
    {
      if (idEdo <= 0 || idMpo <= 0)
        return BadRequest("idEdo e idMpo son obligatorios y deben ser mayores que 0.");

      try
      {
        var result = await _localidadService.GetLocalidadesPagedAsync(pageNumber, pageSize, idEdo, idMpo, search);
        return Ok(result);
      }
      catch (ArgumentException ex)
      {
        return BadRequest(ex.Message);
      }
    }

    [HttpGet("{idLoc}")]
    [ProducesResponseType(typeof(GetLocalidadDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GetLocalidadDto>> GetLocalidad(int idLoc)
    {
      var localidad = await _localidadService.GetByIdAsync(idLoc);
      if (localidad == null) return NotFound();
      return Ok(localidad);
    }


    [HttpPost("RegisterLocalidad")]
    [ProducesResponseType(typeof(GetLocalidadDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<GetLocalidadDto>> RegisterLocalidad([FromBody] RegisterLocalidadDto dto)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var created = await _localidadService.RegisterAsync(dto);
      return CreatedAtAction(nameof(GetLocalidad), new { idLoc = created.idLoc }, created);
    }

    [HttpPut("UpdateLocalidad/{idLoc}")]
    [ProducesResponseType(typeof(GetLocalidadDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GetLocalidadDto>> UpdateLocalidad(int idLoc, [FromBody] UpdateLocalidadDto dto)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var updated = await _localidadService.UpdateAsync(idLoc, dto);
      if (updated == null) return NotFound();

      return Ok(updated);
    }

    [HttpDelete("DeleteLocalidad/{idLoc}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteLocalidad(int idLoc)
    {
      // ahora hace borrado lógico: activo = false
      var desactivado = await _localidadService.DesactivarAsync(idLoc);
      if (!desactivado) 
        return NotFound();

      return NoContent();
    }
  }
}
