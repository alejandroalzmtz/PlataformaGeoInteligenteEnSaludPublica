using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.RegistroMedicoDto
{
  public class RegisterRegistroMedicoDto
  {
    public DateTime fechaIngreso { get; set; }
    public DateTime fechaEgreso { get; set; }
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
    public string idEnfermedad { get; set; } = string.Empty;
    [Required]
    public string CLUES { get; set; } = string.Empty;
  }
}