using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.RegistroMedicoDto
{
  public class BulkIdsDto
  {
    [Required]
    [MinLength(1, ErrorMessage = "Debe enviar al menos un id.")]
    public List<int> ids { get; set; } = new();
  }
}
