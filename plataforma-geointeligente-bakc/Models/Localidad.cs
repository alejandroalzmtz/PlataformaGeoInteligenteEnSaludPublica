namespace SaludPublicaBackend.Models
{
  public class Localidad
  {
    public int idLoc { get; set; }
    public int idLocalidad { get; set; }
    public int idMpo { get; set; }
    public int idEdo { get; set; }
    public string? nombreLocalidad { get; set; }
    public bool activo { get; set; } = true;
  }
}