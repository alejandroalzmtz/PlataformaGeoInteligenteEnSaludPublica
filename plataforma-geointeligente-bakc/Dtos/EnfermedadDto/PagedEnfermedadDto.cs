using System;
using System.Collections.Generic;

namespace SaludPublicaBackend.Dtos.EnfermedadDto
{
  public class PagedEnfermedadDto
  {
    public IReadOnlyList<GetEnfermedadDto> Items { get; init; } = Array.Empty<GetEnfermedadDto>();
    public int PageNumber { get; init; }
    public int PageSize { get; init; }
    public int TotalCount { get; init; }
    public int TotalPages => PageSize == 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPrevious => PageNumber > 1;
    public bool HasNext => PageNumber < TotalPages;
    public string? Search { get; init; }
  }
}
