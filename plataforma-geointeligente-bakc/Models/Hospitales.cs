
namespace SaludPublicaBackend.Models
{
  public class Hospitales
  {
    //PK
    [System.ComponentModel.DataAnnotations.Required]
    public string CLUES { get; set; } = string.Empty;

    // Coordenadas
    public string? Latitud { get; set; }
    public string? Longitud { get; set; }

    // Datos de institución y ubicación
    public string? NombreInstitucion { get; set; }
    public string? ClaveInstitucion { get; set; }
    //FK
    public int Estado { get; set; }
    public int Municipio { get; set; }
    public string? NombreLocalidad { get; set; }
    public int Localidad { get; set; }
    public string? NombreUnidad { get; set; }

    // Dirección y contacto
    public string? Calle { get; set; }
    public string? NumeroExterior { get; set; }
    public string? Colonia { get; set; }
    public string? Lada { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }

    // Otros
    public int? TotalConsultorios { get; set; }
    public string? EstratoUnidad { get; set; }
  }
}
