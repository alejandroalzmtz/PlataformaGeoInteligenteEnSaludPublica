using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.ActividadUsuarioDto
{
  public class RegisterActividadUsuarioDto
  {
    [Required]
    public int idUsuario { get; set; }

    [Required]
    public DateTime fechaInicio { get; set; }

    [Required]
    public DateTime fechaFin { get; set; }

    // Se puede derivar de fechaInicio si se desea, pero se expone para flexibilidad
    [Required]
    public DateOnly fechaActividad { get; set; }

    [Required]
    public TimeOnly hora { get; set; }

    public string? descripcionAccion { get; set; }
  }
}