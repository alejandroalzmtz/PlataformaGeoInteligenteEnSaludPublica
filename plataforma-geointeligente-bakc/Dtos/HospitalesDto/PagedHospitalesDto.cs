namespace SaludPublicaBackend.Dtos.HospitalesDto
{
  public class PagedHospitalesDto
  {
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalItems { get; set; }
    public int TotalPages { get; set; }
    public IEnumerable<GetHospitalesDto> Items { get; set; } = new List<GetHospitalesDto>();

    public bool HasNext => Page < TotalPages;
    public bool HasPrevious => Page > 1;
  }
}
