using Microsoft.AspNetCore.Mvc;
using SaludPublicaBackend.Configurations.CustomHttpResponses;
using SaludPublicaBackend.Dtos.ActividadUsuarioDto;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.ActividadUsuarioRepository;
using SaludPublicaBackend.Services.ActividadUsuarioService;

namespace SaludPublicaBackend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class ActividadUsuarioController : ControllerBase
  {
    private readonly IActividadUsuarioRepository _actividadRepository;
    private readonly IActividadUsuarioService _actividadService;

    public ActividadUsuarioController(IActividadUsuarioRepository actividadRepository,
                                      IActividadUsuarioService actividadService)
    {
      _actividadRepository = actividadRepository;
      _actividadService = actividadService;
    }

    [HttpGet("GetActividades")]
    [ProducesResponseType(typeof(IEnumerable<ActividadUsuario>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<ActividadUsuario>>> GetActividades()
    {
      var actividades = await _actividadRepository.GetAllAsync();
      return Ok(actividades);
    }

    [HttpGet("GetActividadesUsuario/{idUsuario}")]
    [ProducesResponseType(typeof(IEnumerable<GetActividadUsuarioDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<GetActividadUsuarioDto>>> GetActividadesUsuario(int idUsuario)
    {
      var actividades = await _actividadService.GetActividadesPorUsuario(idUsuario);
      return Ok(actividades);
    }


    [HttpPost("RegisterActividadUsuario")]
    [ProducesResponseType(typeof(GetActividadUsuarioDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetActividadUsuarioDto>> RegisterActividadUsuario([FromBody] RegisterActividadUsuarioDto dto)
    {
      var creada = await _actividadService.RegisterActividad(dto);
      return CreatedAtAction(nameof(GetActividades), new { id = creada.idActividad }, creada);
    }
  }
}
