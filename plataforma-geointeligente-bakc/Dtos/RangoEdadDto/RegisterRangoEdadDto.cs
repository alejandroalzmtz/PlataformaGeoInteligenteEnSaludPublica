using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.RangoEdadDto
{
  public class RegisterRangoEdadDto
  {
    [Required]
    public int RangoInicial { get; set; }
    public int RangoFinal { get; set; }
  }
}
