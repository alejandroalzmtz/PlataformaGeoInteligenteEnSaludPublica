namespace SaludPublicaBackend.Dtos.User
{
    public class ValidatePasswordDto
    {
        public int idUsuario { get; set; }
        public string password { get; set; } = string.Empty;
    }
}
