using System.Collections.Generic;

namespace SaludPublicaBackend.Dtos.RegistroMedicoDto
{
  public class PagedRegistroDto
  {
    public int page { get; set; }
    public int pageSize { get; set; }
    public int totalPages { get; set; }
    public int totalRecords { get; set; }          
    public int filteredRecords { get; set; }       
    public bool hasPrevious { get; set; }
    public bool hasNext { get; set; }
    public string? query { get; set; }            
    public List<GetRegistroMedicoDto> registros { get; set; } = new();
  }
}
