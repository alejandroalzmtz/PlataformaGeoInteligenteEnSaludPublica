using System.ComponentModel.DataAnnotations;

namespace SaludPublicaBackend.Dtos.User
{
    public class LoginUserDto
    {
        [Required]
        public string nombreUsuario { get; set; } = null!;

        [Required]
        public string contrasena { get; set; } = null!;
    }

}
