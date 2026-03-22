namespace SaludPublicaBackend.Models
{
  public class ActividadUsuario
  {
    public int idActividad { get; set; }//PK
    public int idUsuario { get; set; }//FK
    public DateTime fechaInicioSesion { get; set; }
    public DateTime fechaFinSesion { get; set; }
    public DateOnly fechaActividad { get; set; }
    public TimeOnly hora { get; set; }
    public string? descripcionAccion { get; set; }
  }
}