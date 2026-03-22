using System;
using System.Collections.Generic;

namespace SaludPublicaBackend.Dtos.EstadosDto
{
  public class PagedEstadosDto
  {
    public IReadOnlyList<GetEstadosDto> Items { get; init; } = Array.Empty<GetEstadosDto>();
    public int PageNumber { get; init; }
    public int PageSize { get; init; }
    public int TotalCount { get; init; }
    public int TotalPages => PageSize == 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPrevious => PageNumber > 1;
    public bool HasNext => PageNumber < TotalPages;
    public string? Search { get; init; }
  }
}
