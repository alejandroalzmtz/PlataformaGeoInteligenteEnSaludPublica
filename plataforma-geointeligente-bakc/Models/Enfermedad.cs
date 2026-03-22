namespace SaludPublicaBackend.Models
{
  public class Enfermedad
  {
    public string idEnfermedad { get; set; } = string.Empty;
    public string? nombreEnfermedad { get; set; }
    public string? descripcion { get; set; }
    public string? codigoICD { get; set; }

    // Nuevo campo: mapea al BIT NOT NULL con default 1
    public bool activo { get; set; } = true;
  }
}