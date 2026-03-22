using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.User
{
  public class RegisterUserDto
  {
    [Required]
    public string? contrasena { get; set; } = null!;
    [Required]
    public string? nombreUsuario { get; set; } = null!;
    public int idRol { get; set; }
  }
}