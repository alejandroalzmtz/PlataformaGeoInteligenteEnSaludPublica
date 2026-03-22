using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.LogoPdfDto
{
  public class UpdateLogoPdfDto
  {
    [Required]
    public int IdLogo { get; set; }

    [Required]
    [MaxLength(255)]
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Imagen como data URL base64 (data:image/png;base64,...). 
    /// El backend extrae los bytes puros antes de guardar.
    /// </summary>
    [Required]
    public string ImagenBase64 { get; set; } = string.Empty;

    [Required]
    [MaxLength(10)]
    public string Formato { get; set; } = string.Empty;

    [Required]
    public long Tamanio { get; set; }

    public bool EsActivo { get; set; }
  }
}
