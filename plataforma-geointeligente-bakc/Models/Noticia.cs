namespace SaludPublicaBackend.Models
{
  public class Noticia
  {
    public int idNoticia { get; set; }
    public string titulo { get; set; } = string.Empty;
    public string contenido { get; set; } = string.Empty;
    public string? imagenPrincipal { get; set; }
  }
}