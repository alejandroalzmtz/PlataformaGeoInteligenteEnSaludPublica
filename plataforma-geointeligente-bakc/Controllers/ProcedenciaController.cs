using Microsoft.AspNetCore.Mvc;
using SaludPublicaBackend.Dtos.ProcedenciaDto;
using SaludPublicaBackend.Services.ProcedenciaService;

namespace SaludPublicaBackend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class ProcedenciaController : ControllerBase
  {
    private readonly IProcedenciaService _service;

    public ProcedenciaController(IProcedenciaService service)
    {
      _service = service;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<GetProcedenciaDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<GetProcedenciaDto>>> GetProcedencias()
    {
      var items = await _service.GetProcedenciasAsync();
      return Ok(items);
    }

    [HttpGet("{idProcedencia}")]
    [ProducesResponseType(typeof(GetProcedenciaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GetProcedenciaDto>> GetProcedencia(int idProcedencia)
    {
      var item = await _service.GetByIdAsync(idProcedencia);
      if (item == null) return NotFound();
      return Ok(item);
    }

    [HttpPost("RegisterProcedencia")]
    [ProducesResponseType(typeof(GetProcedenciaDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<GetProcedenciaDto>> RegisterProcedencia([FromBody] RegisterProcedenciaDto dto)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var created = await _service.RegisterAsync(dto);
      return CreatedAtAction(nameof(GetProcedencia), new { idProcedencia = created.idProcedencia }, created);
    }

    [HttpPut("UpdateProcedencia/{idProcedencia}")]
    [ProducesResponseType(typeof(GetProcedenciaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GetProcedenciaDto>> UpdateProcedencia(int idProcedencia, [FromBody] UpdateProcedenciaDto dto)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var updated = await _service.UpdateAsync(idProcedencia, dto);
      if (updated == null) return NotFound();

      return Ok(updated);
    }

    [HttpDelete("DeleteProcedencia/{idProcedencia}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProcedencia(int idProcedencia)
    {
      var deleted = await _service.DeleteAsync(idProcedencia);
      if (!deleted) return NotFound();
      return NoContent();
    }
  }
}
