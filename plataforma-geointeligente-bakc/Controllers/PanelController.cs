using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaludPublicaBackend.Configurations.CustomHttpResponses;
using SaludPublicaBackend.Dtos.PanelDto;
using SaludPublicaBackend.Services.PanelService;

namespace SaludPublicaBackend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  [Authorize]
  public class PanelController : ControllerBase
  {
    private readonly IPanelService _service;

    public PanelController(IPanelService service)
    {
      _service = service;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<GetPanelDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<GetPanelDto>>> GetAll()
    {
      var panels = await _service.GetAllAsync();
      return Ok(panels);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(GetPanelDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetPanelDto>> GetById(int id)
    {
      var panel = await _service.GetByIdAsync(id);
      return Ok(panel);
    }

    [HttpPost]
    [ProducesResponseType(typeof(GetPanelDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetPanelDto>> Create([FromBody] CreatePanelDto dto)
    {
      var creado = await _service.CreateAsync(dto);
      return CreatedAtAction(nameof(GetById), new { id = creado.idPanel }, creado);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(GetPanelDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetPanelDto>> Update(int id, [FromBody] UpdatePanelDto dto)
    {
      dto.idPanel = id;
      var actualizado = await _service.UpdateAsync(dto);
      return Ok(actualizado);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Delete(int id)
    {
      await _service.DeleteAsync(id);
      return NoContent();
    }
  }
}
