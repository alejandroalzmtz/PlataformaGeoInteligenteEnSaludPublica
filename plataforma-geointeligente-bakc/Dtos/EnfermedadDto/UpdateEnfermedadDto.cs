using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.EnfermedadDto
{
  public class UpdateEnfermedadDto
  {
    [Required]
    [StringLength(20)]
    public string codigoICD { get; set; } = null!;

    [StringLength(200)]
    public string? nombreEnfermedad { get; set; }

    [StringLength(500)]
    public string? descripcion { get; set; }
  }
}