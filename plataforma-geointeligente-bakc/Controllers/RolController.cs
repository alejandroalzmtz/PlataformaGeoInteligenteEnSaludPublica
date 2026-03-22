using Microsoft.AspNetCore.Mvc;
using SaludPublicaBackend.Configurations.CustomHttpResponses;
using SaludPublicaBackend.Dtos.RolDto;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.RolRepository;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SaludPublicaBackend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class RolController : ControllerBase
  {
    private readonly IRolRepository _rolRepository;

    public RolController(IRolRepository rolRepository)
    {
      _rolRepository = rolRepository;
    }

    [HttpGet("GetRoles")]
    [ProducesResponseType(typeof(IEnumerable<Rol>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<Rol>>> GetRoles()
    {
      var roles = await _rolRepository.GetAllAsync();
      return Ok(roles);
    }

    [HttpPost("RegisterRol")]
    [ProducesResponseType(typeof(Rol), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> RegisterRol([FromBody] RegisterRolDto dto)
    {
      if (!ModelState.IsValid)
        return BadRequest(new ErrorMessage { Message = "Datos inválidos." });

      if (await _rolRepository.ExistsByNombreRolAsync(dto.nombreRol!))
        return BadRequest(new ErrorMessage { Message = "El nombre de rol ya existe." });

      var rol = new Rol
      {
        nombreRol = dto.nombreRol,
        descripcion = dto.descripcion
      };

      var rolCreado = await _rolRepository.AddAsync(rol);
      return CreatedAtAction(nameof(GetRoles), new { id = rolCreado.idRol }, rolCreado);
    }
  }
}
