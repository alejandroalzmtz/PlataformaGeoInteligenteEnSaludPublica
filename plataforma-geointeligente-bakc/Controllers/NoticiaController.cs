using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaludPublicaBackend.Configurations.CustomHttpResponses;
using SaludPublicaBackend.Dtos.NoticiaDto;
using SaludPublicaBackend.Services.NoticiaService;

namespace SaludPublicaBackend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  [Authorize]
  public class NoticiaController : ControllerBase
  {
    private readonly INoticiaService _service;

    public NoticiaController(INoticiaService service)
    {
      _service = service;
    }

    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<GetNoticiaDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<GetNoticiaDto>>> GetAll()
    {
      var noticias = await _service.GetAllAsync();
      return Ok(noticias);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(GetNoticiaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetNoticiaDto>> GetById(int id)
    {
      var noticia = await _service.GetByIdAsync(id);
      return Ok(noticia);
    }

    [HttpPost]
    [Authorize(Roles = "1")]
    [ProducesResponseType(typeof(GetNoticiaDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetNoticiaDto>> Create([FromBody] CreateNoticiaDto dto)
    {
      var creado = await _service.CreateAsync(dto);
      return CreatedAtAction(nameof(GetById), new { id = creado.idNoticia }, creado);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "1")]
    [ProducesResponseType(typeof(GetNoticiaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetNoticiaDto>> Update(int id, [FromBody] UpdateNoticiaDto dto)
    {
      dto.idNoticia = id;
      var actualizado = await _service.UpdateAsync(dto);
      return Ok(actualizado);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "1")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Delete(int id)
    {
      await _service.DeleteAsync(id);
      return NoContent();
    }
  }
}