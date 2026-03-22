using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.User
{
    public class UpdateUserDto
    {
        [Required]
        [StringLength(100)]
        public string nombreUsuario { get; set; } = null!;

        [Required]
        [StringLength(150)]
        public string contrasena { get; set; } = null!;

        [Required]
        public int idRol { get; set; }
    }
}
