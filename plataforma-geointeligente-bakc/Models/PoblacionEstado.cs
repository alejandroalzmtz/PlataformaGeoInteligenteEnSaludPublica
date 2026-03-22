using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SaludPublicaBackend.Models
{
    [Table("PoblacionEstado", Schema = "dbo")]
    public class PoblacionEstado
    {
        [Required]
        public int idEstado { get; set; }

        [Required]
        public int Anio { get; set; }

        [Required]
        public long Poblacion { get; set; }
    }
}