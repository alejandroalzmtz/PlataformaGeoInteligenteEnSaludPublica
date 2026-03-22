using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SaludPublicaBackend.Models
{
  public class RegistroMedico
  {
    public int idRegistro { get; set; }
    public DateTime fechaIngreso { get; set; }
    public DateTime fechaEgreso { get; set; }
    public int diasEstancia { get; set; }
    public int idEstado { get; set; }
    public int idMunicipio { get; set; }
    public int idLoc { get; set; }
    public int edad { get; set; }
    public int idSexo { get; set; }
    public int idDerechoHab { get; set; }
    public int idServicioIngreso { get; set; }
    public int idServicioEgreso { get; set; }
    public int idProcedencia { get; set; }
    public int idMotivoEgreso { get; set; }

    [Required]
    [MaxLength(50)]
    public string idEnfermedad { get; set; } = string.Empty;

    public bool Habilitado { get; set; } = true;
    public DateTime? FechaEliminacion { get; set; }

    // FK a tabla Hospitales (RegistroMedico.CLUES → Hospitales.CLUES)
    [Required]
    [MaxLength(50)]
    public string CLUES { get; set; } = string.Empty;

    // Propiedad de navegación (relación configurada en AppDbContext)
    public Hospitales? Hospital { get; set; }
  }
}