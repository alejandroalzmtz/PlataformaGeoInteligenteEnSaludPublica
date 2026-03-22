using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.LogoPdfDto
{
  /// <summary>
  /// DTO para listar logos — NO incluye los bytes de la imagen.
  /// Para obtener la imagen usar GET /api/LogoPdf/{id}/imagen
  /// </summary>
  public class GetLogoPdfDto
  {
    [Required]
    public int IdLogo { get; set; }

    [Required]
    [MaxLength(255)]
    public string Nombre { get; set; } = string.Empty;

    [Required]
    [MaxLength(10)]
    public string Formato { get; set; } = string.Empty;

    [Required]
    public long Tamanio { get; set; }

    [Required]
    public DateTime FechaSubida { get; set; }

    [Required]
    public bool EsActivo { get; set; }

    /// <summary>
    /// URL relativa para obtener la imagen: /api/LogoPdf/{IdLogo}/imagen
    /// </summary>
    public string ImagenUrl { get; set; } = string.Empty;
  }
}
