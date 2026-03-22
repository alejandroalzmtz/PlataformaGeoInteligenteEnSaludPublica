using Microsoft.AspNetCore.Mvc;
using SaludPublicaBackend.Dtos.HospitalesDto;
using SaludPublicaBackend.Services.HospitalesService;

namespace SaludPublicaBackend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class HospitalesController : ControllerBase
  {
    private readonly IHospitalesService _hospitalesService;

    public HospitalesController(IHospitalesService hospitalesService)
    {
      _hospitalesService = hospitalesService;
    }

    [HttpGet("GetHospitales")]
    [ProducesResponseType(typeof(IEnumerable<GetHospitalesDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<GetHospitalesDto>>> GetHospitales()
    {
      var dtos = await _hospitalesService.GetHospitalesAsync();
      return Ok(dtos);
    }

        [HttpGet("Paged")]
        [ProducesResponseType(typeof(PagedHospitalesDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<PagedHospitalesDto>> GetHospitalesPaged(
      [FromQuery] int page = 1,
      [FromQuery] int pageSize = 50,
      [FromQuery] int? estado = null,
      [FromQuery] int? municipio = null,
      [FromQuery] int? localidad = null,
      [FromQuery] string? search = null
    )
        {
            try
            {
                // Validación suave para evitar filtros "mochos"
                if (municipio.HasValue && !estado.HasValue)
                    return BadRequest(new { message = "Si envías municipio, también debes enviar estado." });

                if (localidad.HasValue && (!estado.HasValue || !municipio.HasValue))
                    return BadRequest(new { message = "Si envías localidad, también debes enviar estado y municipio." });

                var paged = await _hospitalesService.GetHospitalesPagedAsync(page, pageSize, estado, municipio, localidad, search);
                return Ok(paged);
            }
            catch (ArgumentOutOfRangeException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }
    }
}
