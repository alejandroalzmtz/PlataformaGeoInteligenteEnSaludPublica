using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.PoblacionEstadoDto
{
    public class DeletePoblacionEstadoDto
    {
        [Required]
        public int idEstado { get; set; }

        [Required]
        public int Anio { get; set; }
    }
}