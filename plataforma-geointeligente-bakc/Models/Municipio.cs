namespace SaludPublicaBackend.Models
{
  public class Municipio
  {
    public int idMunicipio { get; set; }
    public int idMpo { get; set; }
    public string? nombreMunicipio { get; set; }
    public int idEstado { get; set; }
    public bool activo { get; set; } = true;
  }
}