namespace SaludPublicaBackend.Models
{
  public class Estado
  {
    public int idEstado { get; set; }
    public string? nombreEstado { get; set; }

    // Nuevo campo que agregaste en la BD
    public bool activo { get; set; } = true; // default en código también
  }
}