namespace SaludPublicaBackend.Dtos.MunicipioDto
{
  public class GetMunicipioDto
  {
    public int idMunicipio { get; set; }
    public int idMpo { get; set; }
    public string? nombreMunicipio { get; set; }
    public int idEstado { get; set; }
  }

  public class PagedMunicipioDto
  {
    public IReadOnlyList<GetMunicipioDto> Items { get; init; } = Array.Empty<GetMunicipioDto>();
    public int PageNumber { get; init; }
    public int PageSize { get; init; }
    public int TotalCount { get; init; }
    public int TotalPages => PageSize == 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPrevious => PageNumber > 1;
    public bool HasNext => PageNumber < TotalPages;
    public string? Search { get; init; }
  }
}
