using System;

namespace SaludPublicaBackend.Dtos.LocalidadDto
{
  public class GetLocalidadDto
  {
    public int idLoc { get; set; }
    public int idLocalidad { get; set; }
    public int idMpo { get; set; }
    public int idEdo { get; set; }
    public string? nombreLocalidad { get; set; }
  }

  public class PagedLocalidadDto
  {
    public IReadOnlyList<GetLocalidadDto> Items { get; init; } = Array.Empty<GetLocalidadDto>();
    public int PageNumber { get; init; }
    public int PageSize { get; init; }
    public int TotalCount { get; init; }
    public int TotalPages => PageSize == 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPrevious => PageNumber > 1;
    public bool HasNext => PageNumber < TotalPages;
    public string? Search { get; init; }
  }
}
