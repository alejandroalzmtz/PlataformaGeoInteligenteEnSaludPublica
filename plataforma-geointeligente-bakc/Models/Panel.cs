namespace SaludPublicaBackend.Models
{
  public class Panel
  {
    public int idPanel { get; set; }
    public string nombrePanel { get; set; } = string.Empty;
    public string? configuracion { get; set; }
    public int usuarioCreador { get; set; }
    public bool activo { get; set; } = true;
    public DateTime fechaCreacion { get; set; }
    public DateTime? fechaActualizacion { get; set; }

    // Navigation property
    public Usuario? Usuario { get; set; }
  }
}
