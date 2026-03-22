using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.PoblacionEstadoAnualDto
{
    public class GetPoblacionEstadoAnualDto
    {
        [Required]
        public int idEstado { get; set; }

        [Required]
        public int Anio { get; set; }

        [Required]
        public long Poblacion { get; set; }

        [Required]
        public bool EsInterpolado { get; set; }
    }
}
