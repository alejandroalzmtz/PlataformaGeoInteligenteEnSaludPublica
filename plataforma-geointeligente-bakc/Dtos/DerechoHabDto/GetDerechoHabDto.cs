namespace SaludPublicaBackend.Dtos.DerechoHabDto
{
  public class GetDerechoHabDto
  {
    public int idDerechoHab { get; set; }
    public string? descripcion { get; set; }
  }

  public class PagedDerechoHabDto
  {
    public IReadOnlyList<GetDerechoHabDto> Items { get; init; } = Array.Empty<GetDerechoHabDto>();
    public int PageNumber { get; init; }
    public int PageSize { get; init; }
    public int TotalCount { get; init; }
    public int TotalPages => PageSize == 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPrevious => PageNumber > 1;
    public bool HasNext => PageNumber < TotalPages;
    public string? Search { get; init; }
  }
}
