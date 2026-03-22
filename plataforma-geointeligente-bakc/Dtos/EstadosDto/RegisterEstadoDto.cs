using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.EstadosDto
{
  public class RegisterEstadoDto
  {
    [Required]
    [StringLength(50)] // o el tamaño real de tu columna
    public string nombreEstado { get; set; } = string.Empty;
  }
}
