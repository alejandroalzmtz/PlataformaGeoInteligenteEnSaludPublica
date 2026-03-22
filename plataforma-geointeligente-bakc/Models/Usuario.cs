namespace SaludPublicaBackend.Models
{
  public class Usuario
  {
    public int idUsuario { get; set; }
    public string? nombreUsuario { get; set; }
    public string? contrasena { get; set; }
    public DateOnly fechaRegistro { get; set; }
    public int idRol { get; set; }
    public bool activo { get; set; }
    }
}