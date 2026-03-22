using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.EnfermedadDto
{
  public class GetEnfermedadDto
  {
    // PK real según configuración: codigoICD
    [Required]
    [StringLength(20)]
    public string codigoICD { get; set; } = null!;

    // Campo adicional del modelo (no PK)
    public string idEnfermedad { get; set; } = string.Empty;

    [StringLength(200)]
    public string? nombreEnfermedad { get; set; }

    [StringLength(500)]
    public string? descripcion { get; set; }

    // NUEVO: refleja el campo BIT de la tabla
    public bool activo { get; set; }
  }
}
