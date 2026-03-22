using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.NoticiaDto
{
  public class GetNoticiaDto
  {
    [Required]
    public int idNoticia { get; set; }

    [Required]
    [MaxLength(255)]
    public string titulo { get; set; } = string.Empty;

    [Required]
    public string contenido { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? imagenPrincipal { get; set; }
  }
}