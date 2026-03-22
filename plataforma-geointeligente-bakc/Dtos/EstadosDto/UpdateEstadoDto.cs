using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.EstadosDto
{
  public class UpdateEstadoDto
  {
    [Required]
    [StringLength(100)]
    public string nombreEstado { get; set; } = string.Empty;
  }
}
