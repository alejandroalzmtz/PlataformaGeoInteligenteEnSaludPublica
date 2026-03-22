namespace SaludPublicaBackend.Dtos.RegistroMedicoDto
{
  public class GetRegistroMedicoYear
  {
    public int year { get; set; }
    public int? startId { get; set; }
    public int? endId { get; set; }
    public List<int> ids { get; set; } = new();
    public int total { get; set; }
  }
}
