using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaludPublicaBackend.Configurations.CustomHttpResponses;
using SaludPublicaBackend.Dtos.RegistroMedicoDto;
using SaludPublicaBackend.Services.RegistroMedicoService;

namespace SaludPublicaBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize]
    public class RegistroMedController : ControllerBase
    {
        private readonly IRegistroMedicoService _registroService;

        public RegistroMedController(IRegistroMedicoService registroService)
        {
            _registroService = registroService;
        }

        [HttpGet("GetRegistros")]
        [ProducesResponseType(typeof(IEnumerable<GetRegistroMedicoDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<GetRegistroMedicoDto>>> GetRegistros()
        {
            var registros = await _registroService.GetRegistros();
            return Ok(registros);
        }



        [HttpGet("Paged")]
        [ProducesResponseType(typeof(PagedRegistroDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<PagedRegistroDto>> GetRegistrosPaged(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            var dto = await _registroService.GetPagedAsync(page, pageSize);
            return Ok(dto);
        }

        [HttpGet("GetRegistroMedicoYears")]
        [ProducesResponseType(typeof(IEnumerable<GetRegistroMedicoYear>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<GetRegistroMedicoYear>>> GetRegistroMedicoYears([FromQuery] bool includeIds = false)
        {
            var dto = await _registroService.GetRegistrosYearsAsync(includeIds);
            return Ok(dto);
        }

    [HttpGet("GetRegistrosByRange")]
    [ProducesResponseType(typeof(IEnumerable<GetRegistroMedicoDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<GetRegistroMedicoDto>>> GetRegistrosByRange(
        [FromQuery] int startId,
        [FromQuery] int endId)
    {
      var registros = await _registroService.GetRegistrosByRange(startId, endId);
      return Ok(registros);
    }

        [HttpGet("GetRegistroMedicoYear")]
        [ProducesResponseType(typeof(GetRegistroMedicoYear), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<GetRegistroMedicoYear>> GetRegistroMedicoYear([FromQuery] int year, [FromQuery] int? startId, [FromQuery] int? endId, [FromQuery] string? enfermedadCode = null)
        {
            var dto = await _registroService.GetRegistrosYearAsync(year, startId, endId, enfermedadCode);
            return Ok(dto);
        }

        [HttpGet("GetByIds")]
        [ProducesResponseType(typeof(IEnumerable<GetRegistroMedicoDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<GetRegistroMedicoDto>>> GetByIds([FromQuery] string ids)
        {
            if (string.IsNullOrWhiteSpace(ids))
                return Ok(Array.Empty<GetRegistroMedicoDto>());

            var idList = ids.Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(s => int.Parse(s.Trim()))
                            .ToList();

            var rows = await _registroService.GetByIdsAsync(idList);
            return Ok(rows);
        }



        [HttpPost("RegisterRegistroMedico")]
        //[Authorize(Roles = "1")]
        [ProducesResponseType(typeof(GetRegistroMedicoDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<GetRegistroMedicoDto>> RegisterRegistroMedico([FromBody] RegisterRegistroMedicoDto registro)
        {
            var creado = await _registroService.RegisterRegistro(registro);
            return StatusCode(StatusCodes.Status201Created, creado);
        }

        [HttpPut("Update/{id:int}")]
        [Authorize(Roles = "1")]
        [ProducesResponseType(typeof(GetRegistroMedicoDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<GetRegistroMedicoDto>> UpdateRegistroMedico([FromRoute] int id, [FromBody] RegisterRegistroMedicoDto registro)
        {
            var actualizado = await _registroService.UpdateRegistro(id, registro);
            return Ok(actualizado);
        }

        [HttpDelete("Delete/{id:int}")]
        [Authorize(Roles = "1")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteRegistroMedico([FromRoute] int id)
        {
            await _registroService.DeleteRegistro(id);
            return NoContent();
        }
        [HttpDelete("CleanExpired")]
        [Authorize(Roles = "1")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CleanExpired()
        {
            var eliminados = await _registroService.CleanExpiredAsync();
            return Ok(new { eliminados });
        }


        [HttpPut("Revertir/{id:int}")]
        [Authorize(Roles = "1")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> RevertirEliminacion([FromRoute] int id)
        {
            await _registroService.RevertirEliminacion(id);
            return Ok(new
            {
                success = true,
                message = $"El registro {id} fue restaurado correctamente."
            });
        }

        [HttpGet("GetDeshabilitados")]
        [ProducesResponseType(typeof(IEnumerable<GetRegistroMedicoDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<GetRegistroMedicoDto>>> GetRegistrosDeshabilitados()
        {
            var registros = await _registroService.GetRegistrosDeshabilitados();
            return Ok(registros);
        }

        [HttpGet("Search")]
        [ProducesResponseType(typeof(PagedRegistroDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<PagedRegistroDto>> Search(
          [FromQuery] string? query,
          [FromQuery] int page = 1,
          [FromQuery] int pageSize = 50)
        {
            var dto = await _registroService.SearchAsync(query, page, pageSize);
            return Ok(dto);
        }

        [HttpPut("RevertirMasivo")]
        [Authorize(Roles = "1")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> RevertirMasivo([FromBody] BulkIdsDto dto)
        {
            var result = await _registroService.RevertirEliminacionMasivo(dto.ids);
            return Ok(new
            {
                success = true,
                requested = dto.ids.Count,
                updated = result.Updated,
                notFound = result.NotFound
            });
        }
        [HttpPost("DeleteMasivo")]
        [Authorize(Roles = "1")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteMasivo([FromBody] BulkIdsDto dto)
        {
            var result = await _registroService.DeleteRegistroMasivo(dto.ids);
            return Ok(new
            {
                success = true,
                requested = dto.ids.Count,
                deleted = result.Deleted,
                notFound = result.NotFound
            });
        }


    }
}