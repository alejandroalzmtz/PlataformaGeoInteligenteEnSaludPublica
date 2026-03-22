using Microsoft.AspNetCore.Mvc;
using SaludPublicaBackend.Dtos.MunicipioDto;
using SaludPublicaBackend.Services.MunicipioService;

namespace SaludPublicaBackend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class MunicipioController : ControllerBase
  {
    private readonly IMunicipioService _municipioService;

    public MunicipioController(IMunicipioService municipioService)
    {
      _municipioService = municipioService;
    }

    [HttpGet("GetMunicipiosPaged")]
    [ProducesResponseType(typeof(PagedMunicipioDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PagedMunicipioDto>> GetMunicipiosPaged(
      [FromQuery] int pageNumber = 1,
      [FromQuery] int pageSize = 50,
      [FromQuery] int idEstado = 0,
      [FromQuery] string? search = null)
    {
      if (idEstado <= 0)
        return BadRequest("idEstado es obligatorio y debe ser mayor que 0.");

      try
      {
        var result = await _municipioService.GetMunicipiosPagedAsync(pageNumber, pageSize, idEstado, search);
        return Ok(result);
      }
      catch (ArgumentException ex)
      {
        return BadRequest(ex.Message);
      }
    }


    [HttpGet("{idMunicipio}")]
    [ProducesResponseType(typeof(GetMunicipioDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GetMunicipioDto>> GetMunicipio(int idMunicipio)
    {
      var municipio = await _municipioService.GetByIdAsync(idMunicipio);
      if (municipio == null) return NotFound();
      return Ok(municipio);
    }
    [HttpPost("RegisterMunicipio")]
    [ProducesResponseType(typeof(GetMunicipioDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<GetMunicipioDto>> RegisterMunicipio([FromBody] RegisterMunicipioDto dto)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var created = await _municipioService.RegisterAsync(dto);
      return CreatedAtAction(nameof(GetMunicipio), new { idMunicipio = created.idMunicipio }, created);
    }

    [HttpPut("UpdateMunicipio/{idMunicipio}")]
    [ProducesResponseType(typeof(GetMunicipioDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GetMunicipioDto>> UpdateMunicipio(int idMunicipio, [FromBody] UpdateMunicipioDto dto)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var updated = await _municipioService.UpdateAsync(idMunicipio, dto);
      if (updated == null) return NotFound();

      return Ok(updated);
    }

    [HttpDelete("DeleteMunicipio/{idMunicipio}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMunicipio(int idMunicipio)
    {
      // ahora hace borrado lógico: activo = false
      var desactivado = await _municipioService.DesactivarAsync(idMunicipio);
      if (!desactivado)
        return NotFound();

      return NoContent();
    }
  }
}
