using Microsoft.AspNetCore.Mvc;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.RangoEdadRepository;
using System.Collections.Generic;
using SaludPublicaBackend.Configurations.CustomHttpResponses;
using SaludPublicaBackend.Dtos.RangoEdadDto;
using SaludPublicaBackend.Services.RangoEdadService;

namespace SaludPublicaBackend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class RangoEdadController : ControllerBase
  {
    private readonly IRangoEdadRepository _rangoEdadRepository;
    private readonly IRangoEdadService _rangoEdadService;

    public RangoEdadController(IRangoEdadRepository rangoEdadRepository, IRangoEdadService rangoEdadService)
    {
      _rangoEdadRepository = rangoEdadRepository;
      _rangoEdadService = rangoEdadService;
    }

    [HttpGet("GetRangosEdad")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<RangoEdad>>> GetRangosEdad()
    {
      var rangosEdad = await _rangoEdadRepository.GetAllAsync();
      return Ok(rangosEdad);
    }

    [HttpPost("RegisterRangoEdad")]
    [ProducesResponseType(typeof(RangoEdad), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> RegisterRangoEdad([FromBody] RegisterRangoEdadDto dto)
    {
      if (!ModelState.IsValid)
        return BadRequest(new ErrorMessage { Message = "Datos inválidos." });

      if (await _rangoEdadRepository.ExistsByNombreRangoEdadAsync(dto.RangoInicial, dto.RangoFinal))
        return BadRequest(new ErrorMessage { Message = "El rango de edad ya existe." });

      var rangoEdad = new RangoEdad
      {
        RangoInicial = dto.RangoInicial,
        RangoFinal = dto.RangoFinal
      };

      var rangoCreado = await _rangoEdadRepository.AddAsync(rangoEdad);
      return CreatedAtAction(nameof(GetRangosEdad), new { id = rangoCreado.Id }, rangoCreado);
    }

    // ✅ UPDATE usando GetAsync del repositorio genérico
    [HttpPut("UpdateRangoEdad/{id}")]
    [ProducesResponseType(typeof(RangoEdad), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateRangoEdad(int id, [FromBody] RegisterRangoEdadDto dto)
    {
      if (!ModelState.IsValid)
        return BadRequest(new ErrorMessage { Message = "Datos inválidos." });

      var existing = await _rangoEdadRepository.GetAsync(id);
      if (existing == null)
        return NotFound(new ErrorMessage { Message = "Rango de edad no encontrado." });

      if (await _rangoEdadRepository.ExistsByNombreRangoEdadAsync(dto.RangoInicial, dto.RangoFinal) &&
          (existing.RangoInicial != dto.RangoInicial || existing.RangoFinal != dto.RangoFinal))
      {
        return BadRequest(new ErrorMessage { Message = "Ya existe otro rango con esos valores." });
      }

      existing.RangoInicial = dto.RangoInicial;
      existing.RangoFinal = dto.RangoFinal;

      await _rangoEdadRepository.UpdateAsync(existing);
      return Ok(existing);
    }

    // ✅ DELETE usando DeleteAsync por clave
    [HttpDelete("DeleteRangoEdad/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteRangoEdad(int id)
    {
      var existing = await _rangoEdadRepository.GetAsync(id);
      if (existing == null)
        return NotFound(new ErrorMessage { Message = "Rango de edad no encontrado." });

      await _rangoEdadRepository.DeleteAsync(id);
      return NoContent();
    }
  }
}
