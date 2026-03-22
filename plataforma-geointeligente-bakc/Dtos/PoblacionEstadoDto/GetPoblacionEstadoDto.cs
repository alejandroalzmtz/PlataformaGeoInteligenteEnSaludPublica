using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.PoblacionEstadoDto
{
    public class GetPoblacionEstadoDto
    {
        [Required]
        public int idEstado { get; set; }

        [Required]
        public int Anio { get; set; }

        [Required]
        public long Poblacion { get; set; }
    }
}