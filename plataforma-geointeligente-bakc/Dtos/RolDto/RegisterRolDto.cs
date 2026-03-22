using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.RolDto
{
  public class RegisterRolDto
  {
    [Required]
    [StringLength(100)]
    public string? nombreRol { get; set; }

    [StringLength(250)]
    public string? descripcion { get; set; }
  }
}
