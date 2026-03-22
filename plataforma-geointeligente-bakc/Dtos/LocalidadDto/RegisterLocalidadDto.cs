namespace SaludPublicaBackend.Dtos.LocalidadDto
{
  public class RegisterLocalidadDto
  {
    public int idMpo { get; set; }
    public int idEdo { get; set; }
    public string nombreLocalidad { get; set; } = string.Empty;
  }
}
