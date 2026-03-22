using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.EstadoDto
{
  public class GetEstadoDto
  {
    [Required]
    public int idEstado { get; set; }

    [Required]
    public string nombreEstado { get; set; } = string.Empty;
  }
}