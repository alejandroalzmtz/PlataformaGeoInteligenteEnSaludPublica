using Microsoft.AspNetCore.Mvc;
using SaludPublicaBackend.Dtos.DerechoHabDto;
using SaludPublicaBackend.Services.DerechoHabService;

namespace SaludPublicaBackend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class DerechoHabController : ControllerBase
  {
    private readonly IDerechoHabService _service;

    public DerechoHabController(IDerechoHabService service)
    {
      _service = service;
    }

    [HttpGet("GetDerechosHabPaged")]
    [ProducesResponseType(typeof(PagedDerechoHabDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PagedDerechoHabDto>> GetDerechosHabPaged(
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

    [HttpGet("{idDerechoHab}")]
    [ProducesResponseType(typeof(GetDerechoHabDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GetDerechoHabDto>> GetDerechoHab(int idDerechoHab)
    {
      var item = await _service.GetByIdAsync(idDerechoHab);
      if (item == null) return NotFound();
      return Ok(item);
    }

    [HttpPost("RegisterDerechoHab")]
    [ProducesResponseType(typeof(GetDerechoHabDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<GetDerechoHabDto>> RegisterDerechoHab([FromBody] RegisterDerechoHabDto dto)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var created = await _service.RegisterAsync(dto);
      return CreatedAtAction(nameof(GetDerechoHab), new { idDerechoHab = created.idDerechoHab }, created);
    }

    [HttpPut("UpdateDerechoHab/{idDerechoHab}")]
    [ProducesResponseType(typeof(GetDerechoHabDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GetDerechoHabDto>> UpdateDerechoHab(int idDerechoHab, [FromBody] UpdateDerechoHabDto dto)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var updated = await _service.UpdateAsync(idDerechoHab, dto);
      if (updated == null) return NotFound();

      return Ok(updated);
    }

    [HttpDelete("DeleteDerechoHab/{idDerechoHab}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteDerechoHab(int idDerechoHab)
    {
      var deleted = await _service.DeleteAsync(idDerechoHab);
      if (!deleted) return NotFound();
      return NoContent();
    }
  }
}
