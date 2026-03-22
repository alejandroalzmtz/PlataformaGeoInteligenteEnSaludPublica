using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.PoblacionEstadoAnualDto
{
    public class DeletePoblacionEstadoAnualDto
    {
        [Required]
        public int idEstado { get; set; }

        [Required]
        public int Anio { get; set; }
    }
}
