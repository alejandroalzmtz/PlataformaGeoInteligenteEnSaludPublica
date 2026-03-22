using Microsoft.AspNetCore.Mvc;
using SaludPublicaBackend.Dtos.PoblacionEstadoDto;
using SaludPublicaBackend.Services.PoblacionEstadoService;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SaludPublicaBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PoblacionEstadoController : ControllerBase
    {
        private readonly IPoblacionEstadoService _service;

        public PoblacionEstadoController(IPoblacionEstadoService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GetPoblacionEstadoDto>>> GetAll()
        {
            var poblaciones = await _service.GetAllAsync();
            return Ok(poblaciones);
        }

        [HttpGet("{idEstado}")]
        public async Task<ActionResult<IEnumerable<GetPoblacionEstadoDto>>> GetByEstado(int idEstado)
        {
            var poblaciones = await _service.GetByEstadoAsync(idEstado);
            return Ok(poblaciones);
        }

        [HttpGet("{idEstado}/{anio}")]
        public async Task<ActionResult<GetPoblacionEstadoDto>> GetByKey(int idEstado, int anio)
        {
            var poblacion = await _service.GetByKeyAsync(idEstado, anio);
            if (poblacion == null) return NotFound();
            return Ok(poblacion);
        }

        [HttpPost]
        public async Task<ActionResult<GetPoblacionEstadoDto>> Create([FromBody] CreatePoblacionEstadoDto dto)
        {
            var createdPoblacion = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetByKey), new { idEstado = createdPoblacion.idEstado, anio = createdPoblacion.Anio }, createdPoblacion);
        }

        [HttpPut]
        public async Task<ActionResult<GetPoblacionEstadoDto>> Update([FromBody] UpdatePoblacionEstadoDto dto)
        {
            var updatedPoblacion = await _service.UpdateAsync(dto);
            return Ok(updatedPoblacion);
        }

        [HttpDelete("{idEstado}/{anio}")]
        public async Task<IActionResult> Delete(int idEstado, int anio)
        {
            var deleted = await _service.DeleteAsync(idEstado, anio);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}