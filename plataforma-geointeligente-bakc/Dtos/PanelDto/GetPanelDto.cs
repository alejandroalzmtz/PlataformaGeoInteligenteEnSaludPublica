namespace SaludPublicaBackend.Dtos.PanelDto
{
  public class GetPanelDto
  {
    public int idPanel { get; set; }
    public string nombrePanel { get; set; } = string.Empty;
    public string? configuracion { get; set; }
    public int usuarioCreador { get; set; }
    public bool activo { get; set; }
    public DateTime fechaCreacion { get; set; }
    public DateTime? fechaActualizacion { get; set; }
  }
}
