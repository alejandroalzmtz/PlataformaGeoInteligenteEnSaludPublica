using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.User
{
  public class GetUserDto
  {
    [Required]
    public int idUsuario { get; set; }

    [Required]
    [StringLength(100)]
    public string nombreUsuario { get; set; } = null!;

    [Required]
    [StringLength(150)]
    public string contrasena { get; set; } = null!;

    [Required]
    public DateOnly fechaRegistro { get; set; }

    [Required]
    public int idRol { get; set; }
  }
}