using AutoMapper;
using SaludPublicaBackend.Configurations.CustomHttpResponses;
using SaludPublicaBackend.Dtos.LogoPdfDto;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.LogoPdfRepository;

namespace SaludPublicaBackend.Services.LogoPdfService
{
  public class LogoPdfService : ILogoPdfService
  {
    private readonly ILogoPdfRepository _repository;
    private readonly IMapper _mapper;

    public LogoPdfService(ILogoPdfRepository repository, IMapper mapper)
    {
      _repository = repository;
      _mapper = mapper;
    }

    public async Task<IEnumerable<GetLogoPdfDto>> GetAllAsync()
    {
      var logos = await _repository.GetAllAsync();
      var ordered = logos.OrderByDescending(l => l.FechaSubida);
      return _mapper.Map<IEnumerable<GetLogoPdfDto>>(ordered);
    }

    public async Task<GetLogoPdfDto> GetByIdAsync(int id)
    {
      var logo = await _repository.GetAsync(id)
        ?? throw new NotFoundException("LogoPdf", id);
      return _mapper.Map<GetLogoPdfDto>(logo);
    }

    public async Task<GetLogoPdfDto> GetActivoAsync()
    {
      var logo = await _repository.GetActivoAsync()
        ?? throw new NotFoundException("No hay logo activo configurado");
      return _mapper.Map<GetLogoPdfDto>(logo);
    }

    public async Task<(byte[] ImagenData, string Formato)> GetImagenAsync(int id)
    {
      var logo = await _repository.GetAsync(id)
        ?? throw new NotFoundException("LogoPdf", id);

      if (logo.ImagenData == null || logo.ImagenData.Length == 0)
        throw new NotFoundException($"Imagen del logo con ID {id} no encontrada");

      return (logo.ImagenData, logo.Formato);
    }

    public async Task<(byte[] ImagenData, string Formato)> GetImagenActivoAsync()
    {
      var logo = await _repository.GetActivoAsync()
        ?? throw new NotFoundException("No hay logo activo configurado");

      if (logo.ImagenData == null || logo.ImagenData.Length == 0)
        throw new NotFoundException("No hay logo activo configurado");

      return (logo.ImagenData, logo.Formato);
    }

    public async Task<(string DataUrl, string Formato)> GetActivoDataUrlAsync()
    {
      var logo = await _repository.GetActivoAsync()
        ?? throw new NotFoundException("No hay logo activo configurado");

      if (logo.ImagenData == null || logo.ImagenData.Length == 0)
        throw new NotFoundException("No hay logo activo configurado");

      var contentType = GetContentType(logo.Formato);
      var base64 = Convert.ToBase64String(logo.ImagenData);
      var dataUrl = $"data:{contentType};base64,{base64}";

      return (dataUrl, logo.Formato);
    }

    public async Task<GetLogoPdfDto> CreateAsync(IFormFile imagen)
    {
      if (imagen == null || imagen.Length == 0)
        throw new BadRequestException("No se proporcionó una imagen válida");

      if (!imagen.ContentType.StartsWith("image/"))
        throw new BadRequestException("El archivo debe ser una imagen (PNG, JPEG)");

      using var ms = new MemoryStream();
      await imagen.CopyToAsync(ms);
      var imageBytes = ms.ToArray();

      var logo = new LogoPdf
      {
        Nombre = imagen.FileName,
        ImagenData = imageBytes,
        Formato = GetFormatoFromContentType(imagen.ContentType),
        Tamanio = imageBytes.Length,
        FechaSubida = DateTime.Now,
        EsActivo = false
      };

      var creado = await _repository.AddAsync(logo);
      return _mapper.Map<GetLogoPdfDto>(creado);
    }

    public async Task<GetLogoPdfDto> UpdateAsync(int id, IFormFile imagen)
    {
      var existingLogo = await _repository.GetAsync(id)
        ?? throw new NotFoundException("LogoPdf", id);

      if (imagen == null || imagen.Length == 0)
        throw new BadRequestException("No se proporcionó una imagen válida");

      using var ms = new MemoryStream();
      await imagen.CopyToAsync(ms);
      var imageBytes = ms.ToArray();

      existingLogo.Nombre = imagen.FileName;
      existingLogo.ImagenData = imageBytes;
      existingLogo.Formato = GetFormatoFromContentType(imagen.ContentType);
      existingLogo.Tamanio = imageBytes.Length;

      await _repository.UpdateAsync(existingLogo);
      return _mapper.Map<GetLogoPdfDto>(existingLogo);
    }

    public async Task<GetLogoPdfDto> SetActivoAsync(int id)
    {
      var logo = await _repository.GetAsync(id)
        ?? throw new NotFoundException("LogoPdf", id);

      await _repository.DesactivarTodosAsync();

      logo.EsActivo = true;
      await _repository.UpdateAsync(logo);

      return _mapper.Map<GetLogoPdfDto>(logo);
    }

    public async Task DeleteAsync(int id)
    {
      var logo = await _repository.GetAsync(id)
        ?? throw new NotFoundException("LogoPdf", id);

      if (logo.EsActivo)
        throw new BadRequestException("No puedes eliminar el logo activo. Selecciona otro primero.");

      await _repository.DeleteAsync(id);
    }

    public async Task DeleteAllAsync()
    {
      await _repository.DeleteAllAsync();
    }

    // ────────────────── helpers privados ──────────────────

    private static string GetFormatoFromContentType(string contentType) =>
      contentType.Contains("png", StringComparison.OrdinalIgnoreCase) ? "PNG" : "JPEG";

    private static string GetContentType(string formato) =>
      formato.Equals("PNG", StringComparison.OrdinalIgnoreCase) ? "image/png" : "image/jpeg";
  }
}
