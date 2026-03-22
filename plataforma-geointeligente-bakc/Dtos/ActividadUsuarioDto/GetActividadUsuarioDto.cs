using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.ActividadUsuarioDto
{
  public class GetActividadUsuarioDto
  {
    [Required]
    public int idActividad { get; set; }

    [Required]
    public int idUsuario { get; set; }

    [Required]
    public DateTime fechaInicioSesion { get; set; }

    [Required]
    public DateTime fechaFinSesion { get; set; }

    [Required]
    public DateOnly fechaActividad { get; set; }

    [Required]
    public TimeOnly hora { get; set; }

    public string? descripcionAccion { get; set; }
  }
}