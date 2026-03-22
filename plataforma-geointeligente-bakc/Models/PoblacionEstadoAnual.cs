using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SaludPublicaBackend.Models
{
    [Table("PoblacionEstado_Anual", Schema = "dbo")]
    public class PoblacionEstadoAnual
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
