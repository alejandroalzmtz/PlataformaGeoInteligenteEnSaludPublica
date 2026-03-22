using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.PanelDto
{
  public class UpdatePanelDto
  {
    [Required]
    public int idPanel { get; set; }

    [MaxLength(200)]
    public string? nombrePanel { get; set; }

    public string? configuracion { get; set; }
  }
}
