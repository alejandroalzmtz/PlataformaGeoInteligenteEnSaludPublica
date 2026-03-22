namespace SaludPublicaBackend.Dtos.ServicioMedicoDto
{
  public class PagedServicioMedicoDto
  {
    public IEnumerable<GetServicioMedicoDto> Items { get; set; } = Enumerable.Empty<GetServicioMedicoDto>();
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
  }
}