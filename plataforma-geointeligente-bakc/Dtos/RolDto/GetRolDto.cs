using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.RolDto
{
  public class GetRolDto
  {
    [Required]
    public int idRol { get; set; }

    [Required]
    [StringLength(100)]
    public string? nombreRol { get; set; }

    [StringLength(250)]
    public string? descripcion { get; set; }
  }
}
