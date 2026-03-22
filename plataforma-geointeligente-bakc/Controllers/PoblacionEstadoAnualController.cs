using Microsoft.AspNetCore.Mvc;
using SaludPublicaBackend.Dtos.PoblacionEstadoAnualDto;
using SaludPublicaBackend.Services.PoblacionEstadoAnualService;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SaludPublicaBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PoblacionEstadoAnualController : ControllerBase
    {
        private readonly IPoblacionEstadoAnualService _service;

        public PoblacionEstadoAnualController(IPoblacionEstadoAnualService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GetPoblacionEstadoAnualDto>>> GetAll()
        {
            var items = await _service.GetAllAsync();
            return Ok(items);
        }

        [HttpGet("{idEstado}")]
        public async Task<ActionResult<IEnumerable<GetPoblacionEstadoAnualDto>>> GetByEstado(int idEstado)
        {
            var items = await _service.GetByEstadoAsync(idEstado);
            return Ok(items);
        }

        [HttpGet("{idEstado}/{anio}")]
        public async Task<ActionResult<GetPoblacionEstadoAnualDto>> GetByKey(int idEstado, int anio)
        {
            var item = await _service.GetByKeyAsync(idEstado, anio);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<ActionResult<GetPoblacionEstadoAnualDto>> Create([FromBody] CreatePoblacionEstadoAnualDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetByKey), new { idEstado = created.idEstado, anio = created.Anio }, created);
        }

        [HttpPut]
        public async Task<ActionResult<GetPoblacionEstadoAnualDto>> Update([FromBody] UpdatePoblacionEstadoAnualDto dto)
        {
            var updated = await _service.UpdateAsync(dto);
            return Ok(updated);
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
