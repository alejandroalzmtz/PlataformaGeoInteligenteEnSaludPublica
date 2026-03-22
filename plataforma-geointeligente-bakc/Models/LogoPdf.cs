using System.ComponentModel.DataAnnotations.Schema;

namespace SaludPublicaBackend.Models
{
  public class LogoPdf
  {
    public int IdLogo { get; set; }
    public string Nombre { get; set; } = string.Empty;

    [Column(TypeName = "varbinary(max)")]
    public byte[] ImagenData { get; set; } = Array.Empty<byte>();

    public string Formato { get; set; } = string.Empty; // PNG o JPEG
    public long Tamanio { get; set; } // en bytes
    public DateTime FechaSubida { get; set; }
    public bool EsActivo { get; set; }
  }
}
