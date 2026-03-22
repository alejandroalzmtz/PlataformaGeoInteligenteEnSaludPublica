using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.PanelDto
{
  public class CreatePanelDto
  {
    [Required]
    [MaxLength(200)]
    public string nombrePanel { get; set; } = string.Empty;

    public string? configuracion { get; set; }

    [Required]
    public int usuarioCreador { get; set; }
  }
}
