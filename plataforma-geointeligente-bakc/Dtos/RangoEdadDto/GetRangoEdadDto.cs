using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.RangoEdadDto
{
  public class GetRangoEdadDto
  {
    [Required]
    public int Id { get; set; }
    public int RangoInicial { get; set; }
    public int RangoFinal { get; set; }

  }
}

