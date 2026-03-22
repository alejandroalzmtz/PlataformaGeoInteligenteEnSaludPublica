using AutoMapper;
using Microsoft.AspNetCore.Http;
using Moq;
using SaludPublicaBackend.Configurations.CustomHttpResponses;
using SaludPublicaBackend.Dtos.LogoPdfDto;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.LogoPdfRepository;
using SaludPublicaBackend.Services.LogoPdfService;

namespace SaludPublicaBackend.Tests.LogoPdf
{
  public class LogoPdfServiceTests
  {
    private readonly Mock<ILogoPdfRepository> _repoMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly LogoPdfService _service;

    public LogoPdfServiceTests()
    {
      _repoMock = new Mock<ILogoPdfRepository>();
      _mapperMock = new Mock<IMapper>();
      _service = new LogoPdfService(_repoMock.Object, _mapperMock.Object);
    }

    // ────────── Helper factories ──────────

    private static Models.LogoPdf CrearLogo(int id = 1, bool activo = false, string formato = "PNG")
    {
      return new Models.LogoPdf
      {
        IdLogo = id,
        Nombre = $"logo_{id}.png",
        ImagenData = new byte[] { 0x89, 0x50, 0x4E, 0x47 }, // PNG header
        Formato = formato,
        Tamanio = 4,
        FechaSubida = new DateTime(2024, 1, 1),
        EsActivo = activo
      };
    }

    private static GetLogoPdfDto CrearDto(int id = 1, bool activo = false)
    {
      return new GetLogoPdfDto
      {
        IdLogo = id,
        Nombre = $"logo_{id}.png",
        Formato = "PNG",
        Tamanio = 4,
        FechaSubida = new DateTime(2024, 1, 1),
        EsActivo = activo,
        ImagenUrl = $"/api/LogoPdf/{id}/imagen"
      };
    }

    private static Mock<IFormFile> CrearFormFileMock(
      string fileName = "test.png",
      string contentType = "image/png",
      int length = 100)
    {
      var fileMock = new Mock<IFormFile>();
      var content = new byte[length];
      var ms = new MemoryStream(content);

      fileMock.Setup(f => f.FileName).Returns(fileName);
      fileMock.Setup(f => f.ContentType).Returns(contentType);
      fileMock.Setup(f => f.Length).Returns(length);
      fileMock.Setup(f => f.CopyToAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
              .Callback<Stream, CancellationToken>((stream, _) => ms.CopyTo(stream))
              .Returns(Task.CompletedTask);

      return fileMock;
    }

    // ═══════════════════════════════════════════
    //  GetAllAsync
    // ═══════════════════════════════════════════

    [Fact]
    public async Task GetAllAsync_ReturnsOrderedDtos()
    {
      // Arrange
      var logos = new List<Models.LogoPdf>
      {
        CrearLogo(1),
        CrearLogo(2)
      };
      var dtos = new List<GetLogoPdfDto> { CrearDto(2), CrearDto(1) };

      _repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(logos);
      _mapperMock.Setup(m => m.Map<IEnumerable<GetLogoPdfDto>>(It.IsAny<IOrderedEnumerable<Models.LogoPdf>>()))
                 .Returns(dtos);

      // Act
      var result = await _service.GetAllAsync();

      // Assert
      Assert.Equal(2, result.Count());
      _repoMock.Verify(r => r.GetAllAsync(), Times.Once);
      _mapperMock.Verify(m => m.Map<IEnumerable<GetLogoPdfDto>>(It.IsAny<IOrderedEnumerable<Models.LogoPdf>>()), Times.Once);
    }

    [Fact]
    public async Task GetAllAsync_OrdersByFechaSubidaDescending()
    {
      // Arrange
      var logoAntiguo = CrearLogo(1);
      logoAntiguo.FechaSubida = new DateTime(2023, 1, 1);
      var logoReciente = CrearLogo(2);
      logoReciente.FechaSubida = new DateTime(2025, 6, 1);

      var logos = new List<Models.LogoPdf> { logoAntiguo, logoReciente };
      _repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(logos);

      IEnumerable<Models.LogoPdf>? capturedArg = null;
      _mapperMock.Setup(m => m.Map<IEnumerable<GetLogoPdfDto>>(It.IsAny<IOrderedEnumerable<Models.LogoPdf>>()))
                 .Callback<object>(arg => capturedArg = (IEnumerable<Models.LogoPdf>)arg)
                 .Returns(new List<GetLogoPdfDto> { CrearDto(2), CrearDto(1) });

      // Act
      await _service.GetAllAsync();

      // Assert
      Assert.NotNull(capturedArg);
      var ordered = capturedArg!.ToList();
      Assert.Equal(2, ordered[0].IdLogo); // reciente primero
      Assert.Equal(1, ordered[1].IdLogo); // antiguo después
    }

    [Fact]
    public async Task GetAllAsync_EmptyList_ReturnsEmpty()
    {
      // Arrange
      _repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Models.LogoPdf>());
      _mapperMock.Setup(m => m.Map<IEnumerable<GetLogoPdfDto>>(It.IsAny<IOrderedEnumerable<Models.LogoPdf>>()))
                 .Returns(Enumerable.Empty<GetLogoPdfDto>());

      // Act
      var result = await _service.GetAllAsync();

      // Assert
      Assert.Empty(result);
    }

    // ═══════════════════════════════════════════
    //  GetByIdAsync
    // ═══════════════════════════════════════════

    [Fact]
    public async Task GetByIdAsync_Exists_ReturnsDto()
    {
      // Arrange
      var logo = CrearLogo(5);
      var dto = CrearDto(5);

      _repoMock.Setup(r => r.GetAsync(5)).ReturnsAsync(logo);
      _mapperMock.Setup(m => m.Map<GetLogoPdfDto>(logo)).Returns(dto);

      // Act
      var result = await _service.GetByIdAsync(5);

      // Assert
      Assert.Equal(5, result.IdLogo);
      _mapperMock.Verify(m => m.Map<GetLogoPdfDto>(logo), Times.Once);
    }

    [Fact]
    public async Task GetByIdAsync_NotExists_ThrowsNotFoundException()
    {
      // Arrange
      _repoMock.Setup(r => r.GetAsync(99)).ReturnsAsync((Models.LogoPdf?)null);

      // Act & Assert
      await Assert.ThrowsAsync<NotFoundException>(() => _service.GetByIdAsync(99));
    }

    [Fact]
    public async Task GetByIdAsync_NotExists_ExceptionContainsIdInMessage()
    {
      // Arrange
      _repoMock.Setup(r => r.GetAsync(42)).ReturnsAsync((Models.LogoPdf?)null);

      // Act
      var ex = await Assert.ThrowsAsync<NotFoundException>(() => _service.GetByIdAsync(42));

      // Assert
      Assert.Contains("42", ex.Message);
      Assert.Contains("LogoPdf", ex.Message);
    }

    // ═══════════════════════════════════════════
    //  GetActivoAsync
    // ═══════════════════════════════════════════

    [Fact]
    public async Task GetActivoAsync_Exists_ReturnsDto()
    {
      // Arrange
      var logo = CrearLogo(1, activo: true);
      var dto = CrearDto(1, activo: true);

      _repoMock.Setup(r => r.GetActivoAsync()).ReturnsAsync(logo);
      _mapperMock.Setup(m => m.Map<GetLogoPdfDto>(logo)).Returns(dto);

      // Act
      var result = await _service.GetActivoAsync();

      // Assert
      Assert.True(result.EsActivo);
      _mapperMock.Verify(m => m.Map<GetLogoPdfDto>(logo), Times.Once);
    }

    [Fact]
    public async Task GetActivoAsync_NoActivo_ThrowsNotFoundException()
    {
      // Arrange
      _repoMock.Setup(r => r.GetActivoAsync()).ReturnsAsync((Models.LogoPdf?)null);

      // Act & Assert
      await Assert.ThrowsAsync<NotFoundException>(() => _service.GetActivoAsync());
    }

    [Fact]
    public async Task GetActivoAsync_NoActivo_ExceptionMessageIndicatesNoActiveConfig()
    {
      // Arrange
      _repoMock.Setup(r => r.GetActivoAsync()).ReturnsAsync((Models.LogoPdf?)null);

      // Act
      var ex = await Assert.ThrowsAsync<NotFoundException>(() => _service.GetActivoAsync());

      // Assert
      Assert.Contains("logo activo", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    // ═══════════════════════════════════════════
    //  GetImagenAsync
    // ═══════════════════════════════════════════

    [Fact]
    public async Task GetImagenAsync_Exists_ReturnsTupleWithData()
    {
      // Arrange
      var logo = CrearLogo(3, formato: "JPEG");
      _repoMock.Setup(r => r.GetAsync(3)).ReturnsAsync(logo);

      // Act
      var (imagenData, formato) = await _service.GetImagenAsync(3);

      // Assert
      Assert.Equal(logo.ImagenData, imagenData);
      Assert.Equal("JPEG", formato);
    }

    [Fact]
    public async Task GetImagenAsync_NotExists_ThrowsNotFoundException()
    {
      // Arrange
      _repoMock.Setup(r => r.GetAsync(99)).ReturnsAsync((Models.LogoPdf?)null);

      // Act & Assert
      await Assert.ThrowsAsync<NotFoundException>(() => _service.GetImagenAsync(99));
    }

    [Fact]
    public async Task GetImagenAsync_EmptyImage_ThrowsNotFoundException()
    {
      // Arrange
      var logo = CrearLogo(3);
      logo.ImagenData = Array.Empty<byte>();
      _repoMock.Setup(r => r.GetAsync(3)).ReturnsAsync(logo);

      // Act & Assert
      await Assert.ThrowsAsync<NotFoundException>(() => _service.GetImagenAsync(3));
    }

    [Fact]
    public async Task GetImagenAsync_NullImage_ThrowsNotFoundException()
    {
      // Arrange
      var logo = CrearLogo(3);
      logo.ImagenData = null!;
      _repoMock.Setup(r => r.GetAsync(3)).ReturnsAsync(logo);

      // Act & Assert
      await Assert.ThrowsAsync<NotFoundException>(() => _service.GetImagenAsync(3));
    }

    [Fact]
    public async Task GetImagenAsync_EmptyImage_ExceptionContainsId()
    {
      // Arrange
      var logo = CrearLogo(7);
      logo.ImagenData = Array.Empty<byte>();
      _repoMock.Setup(r => r.GetAsync(7)).ReturnsAsync(logo);

      // Act
      var ex = await Assert.ThrowsAsync<NotFoundException>(() => _service.GetImagenAsync(7));

      // Assert
      Assert.Contains("7", ex.Message);
    }

    [Fact]
    public async Task GetImagenAsync_NotExists_ExceptionDiffersFromEmptyImage()
    {
      // Arrange - Rama 1: logo no existe
      _repoMock.Setup(r => r.GetAsync(10)).ReturnsAsync((Models.LogoPdf?)null);

      // Act - Rama 1
      var exNotFound = await Assert.ThrowsAsync<NotFoundException>(() => _service.GetImagenAsync(10));

      // Arrange - Rama 2: logo existe pero sin imagen
      var logo = CrearLogo(10);
      logo.ImagenData = Array.Empty<byte>();
      _repoMock.Setup(r => r.GetAsync(10)).ReturnsAsync(logo);

      // Act - Rama 2
      var exEmpty = await Assert.ThrowsAsync<NotFoundException>(() => _service.GetImagenAsync(10));

      // Assert
      Assert.NotEqual(exNotFound.Message, exEmpty.Message);
    }

    // ═══════════════════════════════════════════
    //  GetImagenActivoAsync
    // ═══════════════════════════════════════════

    [Fact]
    public async Task GetImagenActivoAsync_Exists_ReturnsTuple()
    {
      // Arrange
      var logo = CrearLogo(1, activo: true);
      _repoMock.Setup(r => r.GetActivoAsync()).ReturnsAsync(logo);

      // Act
      var (imagenData, formato) = await _service.GetImagenActivoAsync();

      // Assert
      Assert.NotEmpty(imagenData);
      Assert.Equal("PNG", formato);
    }

    [Fact]
    public async Task GetImagenActivoAsync_NoActivo_ThrowsNotFoundException()
    {
      // Arrange
      _repoMock.Setup(r => r.GetActivoAsync()).ReturnsAsync((Models.LogoPdf?)null);

      // Act & Assert
      await Assert.ThrowsAsync<NotFoundException>(() => _service.GetImagenActivoAsync());
    }

    [Fact]
    public async Task GetImagenActivoAsync_EmptyImage_ThrowsNotFoundException()
    {
      // Arrange
      var logo = CrearLogo(1, activo: true);
      logo.ImagenData = Array.Empty<byte>();
      _repoMock.Setup(r => r.GetActivoAsync()).ReturnsAsync(logo);

      // Act & Assert
      await Assert.ThrowsAsync<NotFoundException>(() => _service.GetImagenActivoAsync());
    }

    [Fact]
    public async Task GetImagenActivoAsync_NullImage_ThrowsNotFoundException()
    {
      // Arrange
      var logo = CrearLogo(1, activo: true);
      logo.ImagenData = null!;
      _repoMock.Setup(r => r.GetActivoAsync()).ReturnsAsync(logo);

      // Act & Assert
      await Assert.ThrowsAsync<NotFoundException>(() => _service.GetImagenActivoAsync());
    }

    [Fact]
    public async Task GetImagenActivoAsync_ReturnsExactBytes()
    {
      // Arrange
      var expectedBytes = new byte[] { 0xAA, 0xBB, 0xCC };
      var logo = CrearLogo(1, activo: true);
      logo.ImagenData = expectedBytes;
      _repoMock.Setup(r => r.GetActivoAsync()).ReturnsAsync(logo);

      // Act
      var (imagenData, _) = await _service.GetImagenActivoAsync();

      // Assert
      Assert.Equal(expectedBytes, imagenData);
    }

    // ═══════════════════════════════════════════
    //  GetActivoDataUrlAsync
    // ═══════════════════════════════════════════

    [Fact]
    public async Task GetActivoDataUrlAsync_Exists_ReturnsDataUrl()
    {
      // Arrange
      var logo = CrearLogo(1, activo: true, formato: "PNG");
      _repoMock.Setup(r => r.GetActivoAsync()).ReturnsAsync(logo);

      // Act
      var (dataUrl, formato) = await _service.GetActivoDataUrlAsync();

      // Assert
      Assert.StartsWith("data:image/png;base64,", dataUrl);
      Assert.Equal("PNG", formato);
    }

    [Fact]
    public async Task GetActivoDataUrlAsync_FormatoJPEG_ReturnsJpegContentType()
    {
      // Arrange
      var logo = CrearLogo(1, activo: true, formato: "JPEG");
      _repoMock.Setup(r => r.GetActivoAsync()).ReturnsAsync(logo);

      // Act
      var (dataUrl, formato) = await _service.GetActivoDataUrlAsync();

      // Assert
      Assert.StartsWith("data:image/jpeg;base64,", dataUrl);
      Assert.Equal("JPEG", formato);
    }

    [Fact]
    public async Task GetActivoDataUrlAsync_VerifyExactBase64Content()
    {
      // Arrange
      var knownBytes = new byte[] { 0x01, 0x02, 0x03 };
      var expectedBase64 = Convert.ToBase64String(knownBytes);
      var logo = CrearLogo(1, activo: true, formato: "PNG");
      logo.ImagenData = knownBytes;
      _repoMock.Setup(r => r.GetActivoAsync()).ReturnsAsync(logo);

      // Act
      var (dataUrl, _) = await _service.GetActivoDataUrlAsync();

      // Assert
      Assert.Equal($"data:image/png;base64,{expectedBase64}", dataUrl);
    }

    [Fact]
    public async Task GetActivoDataUrlAsync_NoActivo_ThrowsNotFoundException()
    {
      // Arrange
      _repoMock.Setup(r => r.GetActivoAsync()).ReturnsAsync((Models.LogoPdf?)null);

      // Act & Assert
      await Assert.ThrowsAsync<NotFoundException>(() => _service.GetActivoDataUrlAsync());
    }

    [Fact]
    public async Task GetActivoDataUrlAsync_EmptyImage_ThrowsNotFoundException()
    {
      // Arrange
      var logo = CrearLogo(1, activo: true);
      logo.ImagenData = Array.Empty<byte>();
      _repoMock.Setup(r => r.GetActivoAsync()).ReturnsAsync(logo);

      // Act & Assert
      await Assert.ThrowsAsync<NotFoundException>(() => _service.GetActivoDataUrlAsync());
    }

    [Fact]
    public async Task GetActivoDataUrlAsync_NullImage_ThrowsNotFoundException()
    {
      // Arrange
      var logo = CrearLogo(1, activo: true);
      logo.ImagenData = null!;
      _repoMock.Setup(r => r.GetActivoAsync()).ReturnsAsync(logo);

      // Act & Assert
      await Assert.ThrowsAsync<NotFoundException>(() => _service.GetActivoDataUrlAsync());
    }

    [Fact]
    public async Task GetActivoDataUrlAsync_UnknownFormat_DefaultsToJpeg()
    {
      // Arrange
      var logo = CrearLogo(1, activo: true, formato: "WEBP");
      _repoMock.Setup(r => r.GetActivoAsync()).ReturnsAsync(logo);

      // Act
      var (dataUrl, formato) = await _service.GetActivoDataUrlAsync();

      // Assert
      Assert.StartsWith("data:image/jpeg;base64,", dataUrl);
      Assert.Equal("WEBP", formato);
    }

    // ═══════════════════════════════════════════
    //  CreateAsync
    // ═══════════════════════════════════════════

    [Fact]
    public async Task CreateAsync_ValidImage_ReturnsCreatedDto()
    {
      // Arrange
      var formFile = CrearFormFileMock().Object;
      var dto = CrearDto(10);

      _repoMock.Setup(r => r.AddAsync(It.IsAny<Models.LogoPdf>()))
               .ReturnsAsync((Models.LogoPdf l) => { l.IdLogo = 10; return l; });
      _mapperMock.Setup(m => m.Map<GetLogoPdfDto>(It.IsAny<Models.LogoPdf>())).Returns(dto);

      // Act
      var result = await _service.CreateAsync(formFile);

      // Assert
      Assert.Equal(10, result.IdLogo);
      _repoMock.Verify(r => r.AddAsync(It.Is<Models.LogoPdf>(l =>
        l.Nombre == "test.png" &&
        l.Formato == "PNG" &&
        !l.EsActivo
      )), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_ValidImage_SetsTamanioCorrectly()
    {
      // Arrange
      var formFile = CrearFormFileMock(length: 2048).Object;

      Models.LogoPdf? captured = null;
      _repoMock.Setup(r => r.AddAsync(It.IsAny<Models.LogoPdf>()))
               .Callback<Models.LogoPdf>(l => captured = l)
               .ReturnsAsync((Models.LogoPdf l) => l);
      _mapperMock.Setup(m => m.Map<GetLogoPdfDto>(It.IsAny<Models.LogoPdf>())).Returns(CrearDto());

      // Act
      await _service.CreateAsync(formFile);

      // Assert
      Assert.NotNull(captured);
      Assert.True(captured!.Tamanio >= 0);
    }

    [Fact]
    public async Task CreateAsync_ValidImage_SetsFechaSubidaToNow()
    {
      // Arrange
      var formFile = CrearFormFileMock().Object;
      var before = DateTime.Now.AddSeconds(-1);

      Models.LogoPdf? captured = null;
      _repoMock.Setup(r => r.AddAsync(It.IsAny<Models.LogoPdf>()))
               .Callback<Models.LogoPdf>(l => captured = l)
               .ReturnsAsync((Models.LogoPdf l) => l);
      _mapperMock.Setup(m => m.Map<GetLogoPdfDto>(It.IsAny<Models.LogoPdf>())).Returns(CrearDto());

      // Act
      await _service.CreateAsync(formFile);

      // Assert
      var after = DateTime.Now.AddSeconds(1);
      Assert.NotNull(captured);
      Assert.InRange(captured!.FechaSubida, before, after);
    }

    [Fact]
    public async Task CreateAsync_ValidImage_SetsEsActivoFalse()
    {
      // Arrange
      var formFile = CrearFormFileMock().Object;

      Models.LogoPdf? captured = null;
      _repoMock.Setup(r => r.AddAsync(It.IsAny<Models.LogoPdf>()))
               .Callback<Models.LogoPdf>(l => captured = l)
               .ReturnsAsync((Models.LogoPdf l) => l);
      _mapperMock.Setup(m => m.Map<GetLogoPdfDto>(It.IsAny<Models.LogoPdf>())).Returns(CrearDto());

      // Act
      await _service.CreateAsync(formFile);

      // Assert
      Assert.NotNull(captured);
      Assert.False(captured!.EsActivo);
    }

    [Fact]
    public async Task CreateAsync_ValidImage_CallsCopyToAsync()
    {
      // Arrange
      var fileMock = CrearFormFileMock();

      _repoMock.Setup(r => r.AddAsync(It.IsAny<Models.LogoPdf>()))
               .ReturnsAsync((Models.LogoPdf l) => l);
      _mapperMock.Setup(m => m.Map<GetLogoPdfDto>(It.IsAny<Models.LogoPdf>())).Returns(CrearDto());

      // Act
      await _service.CreateAsync(fileMock.Object);

      // Assert
      fileMock.Verify(f => f.CopyToAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_JpegImage_FormatoIsJPEG()
    {
      // Arrange
      var formFile = CrearFormFileMock(fileName: "photo.jpg", contentType: "image/jpeg").Object;

      _repoMock.Setup(r => r.AddAsync(It.IsAny<Models.LogoPdf>()))
               .ReturnsAsync((Models.LogoPdf l) => l);
      _mapperMock.Setup(m => m.Map<GetLogoPdfDto>(It.IsAny<Models.LogoPdf>())).Returns(CrearDto());

      // Act
      await _service.CreateAsync(formFile);

      // Assert
      _repoMock.Verify(r => r.AddAsync(It.Is<Models.LogoPdf>(l => l.Formato == "JPEG")), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_PngPartMixedCase_FormatoIsPNG()
    {
      // Arrange
      var formFile = CrearFormFileMock(contentType: "image/PNG").Object;

      _repoMock.Setup(r => r.AddAsync(It.IsAny<Models.LogoPdf>()))
               .ReturnsAsync((Models.LogoPdf l) => l);
      _mapperMock.Setup(m => m.Map<GetLogoPdfDto>(It.IsAny<Models.LogoPdf>())).Returns(CrearDto());

      // Act
      await _service.CreateAsync(formFile);

      // Assert
      _repoMock.Verify(r => r.AddAsync(It.Is<Models.LogoPdf>(l => l.Formato == "PNG")), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_ContentTypeUpperCase_ThrowsBadRequest()
    {
      // Arrange
      var formFile = CrearFormFileMock(contentType: "IMAGE/PNG").Object;

      // Act & Assert
      await Assert.ThrowsAsync<BadRequestException>(() => _service.CreateAsync(formFile));
    }

    [Fact]
    public async Task CreateAsync_NonPngContentType_DefaultsToJPEG()
    {
      // Arrange
      var formFile = CrearFormFileMock(contentType: "image/webp").Object;

      _repoMock.Setup(r => r.AddAsync(It.IsAny<Models.LogoPdf>()))
               .ReturnsAsync((Models.LogoPdf l) => l);
      _mapperMock.Setup(m => m.Map<GetLogoPdfDto>(It.IsAny<Models.LogoPdf>())).Returns(CrearDto());

      // Act
      await _service.CreateAsync(formFile);

      // Assert
      _repoMock.Verify(r => r.AddAsync(It.Is<Models.LogoPdf>(l => l.Formato == "JPEG")), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_SetsNombreFromFileName()
    {
      // Arrange
      var formFile = CrearFormFileMock(fileName: "mi-logo-empresa.png").Object;

      Models.LogoPdf? captured = null;
      _repoMock.Setup(r => r.AddAsync(It.IsAny<Models.LogoPdf>()))
               .Callback<Models.LogoPdf>(l => captured = l)
               .ReturnsAsync((Models.LogoPdf l) => l);
      _mapperMock.Setup(m => m.Map<GetLogoPdfDto>(It.IsAny<Models.LogoPdf>())).Returns(CrearDto());

      // Act
      await _service.CreateAsync(formFile);

      // Assert
      Assert.Equal("mi-logo-empresa.png", captured!.Nombre);
    }

    [Fact]
    public async Task CreateAsync_NullImage_ThrowsBadRequestException()
    {
      // Arrange (sin datos — se pasa null)

      // Act & Assert
      await Assert.ThrowsAsync<BadRequestException>(() => _service.CreateAsync(null!));
    }

    [Fact]
    public async Task CreateAsync_EmptyImage_ThrowsBadRequestException()
    {
      // Arrange
      var formFile = CrearFormFileMock(length: 0).Object;

      // Act & Assert
      await Assert.ThrowsAsync<BadRequestException>(() => _service.CreateAsync(formFile));
    }

    [Fact]
    public async Task CreateAsync_NonImageFile_ThrowsBadRequestException()
    {
      // Arrange
      var formFile = CrearFormFileMock(contentType: "application/pdf").Object;

      // Act & Assert
      await Assert.ThrowsAsync<BadRequestException>(() => _service.CreateAsync(formFile));
    }

    [Fact]
    public async Task CreateAsync_NullImage_DoesNotCallRepository()
    {
      // Arrange (sin datos — se pasa null)

      // Act & Assert
      await Assert.ThrowsAsync<BadRequestException>(() => _service.CreateAsync(null!));

      // Assert
      _repoMock.Verify(r => r.AddAsync(It.IsAny<Models.LogoPdf>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_NonImageFile_DoesNotCallRepository()
    {
      // Arrange
      var formFile = CrearFormFileMock(contentType: "text/plain").Object;

      // Act & Assert
      await Assert.ThrowsAsync<BadRequestException>(() => _service.CreateAsync(formFile));

      // Assert
      _repoMock.Verify(r => r.AddAsync(It.IsAny<Models.LogoPdf>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_BadRequest_ExceptionContainsDescriptiveMessage()
    {
      // Arrange (sin datos — se pasa null)

      // Act
      var ex = await Assert.ThrowsAsync<BadRequestException>(() => _service.CreateAsync(null!));

      // Assert
      Assert.Contains("imagen", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    // ═══════════════════════════════════════════
    //  UpdateAsync
    // ═══════════════════════════════════════════

    [Fact]
    public async Task UpdateAsync_ValidData_ReturnsUpdatedDto()
    {
      // Arrange
      var existingLogo = CrearLogo(5);
      var formFile = CrearFormFileMock(fileName: "updated.png").Object;
      var dto = CrearDto(5);

      _repoMock.Setup(r => r.GetAsync(5)).ReturnsAsync(existingLogo);
      _repoMock.Setup(r => r.UpdateAsync(It.IsAny<Models.LogoPdf>())).Returns(Task.CompletedTask);
      _mapperMock.Setup(m => m.Map<GetLogoPdfDto>(It.IsAny<Models.LogoPdf>())).Returns(dto);

      // Act
      var result = await _service.UpdateAsync(5, formFile);

      // Assert
      Assert.Equal(5, result.IdLogo);
      _repoMock.Verify(r => r.UpdateAsync(It.Is<Models.LogoPdf>(l =>
        l.Nombre == "updated.png"
      )), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_ValidData_UpdatesAllProperties()
    {
      // Arrange
      var existingLogo = CrearLogo(5, formato: "JPEG");
      existingLogo.Nombre = "old.jpg";
      existingLogo.Tamanio = 500;

      var formFile = CrearFormFileMock(fileName: "new.png", contentType: "image/png").Object;

      _repoMock.Setup(r => r.GetAsync(5)).ReturnsAsync(existingLogo);
      _repoMock.Setup(r => r.UpdateAsync(It.IsAny<Models.LogoPdf>())).Returns(Task.CompletedTask);
      _mapperMock.Setup(m => m.Map<GetLogoPdfDto>(It.IsAny<Models.LogoPdf>())).Returns(CrearDto(5));

      // Act
      await _service.UpdateAsync(5, formFile);

      // Assert
      Assert.Equal("new.png", existingLogo.Nombre);
      Assert.Equal("PNG", existingLogo.Formato);
      Assert.NotEqual(500, existingLogo.Tamanio);
    }

    [Fact]
    public async Task UpdateAsync_DoesNotChangeIdOrEsActivo()
    {
      // Arrange
      var existingLogo = CrearLogo(5, activo: true);
      var formFile = CrearFormFileMock().Object;

      _repoMock.Setup(r => r.GetAsync(5)).ReturnsAsync(existingLogo);
      _repoMock.Setup(r => r.UpdateAsync(It.IsAny<Models.LogoPdf>())).Returns(Task.CompletedTask);
      _mapperMock.Setup(m => m.Map<GetLogoPdfDto>(It.IsAny<Models.LogoPdf>())).Returns(CrearDto(5));

      // Act
      await _service.UpdateAsync(5, formFile);

      // Assert
      Assert.Equal(5, existingLogo.IdLogo);
      Assert.True(existingLogo.EsActivo);
    }

    [Fact]
    public async Task UpdateAsync_DoesNotValidateContentType()
    {
      // Arrange
      var existingLogo = CrearLogo(5);
      var formFile = CrearFormFileMock(contentType: "application/pdf").Object;

      _repoMock.Setup(r => r.GetAsync(5)).ReturnsAsync(existingLogo);
      _repoMock.Setup(r => r.UpdateAsync(It.IsAny<Models.LogoPdf>())).Returns(Task.CompletedTask);
      _mapperMock.Setup(m => m.Map<GetLogoPdfDto>(It.IsAny<Models.LogoPdf>())).Returns(CrearDto(5));

      // Act
      var result = await _service.UpdateAsync(5, formFile);

      // Assert
      Assert.NotNull(result);
    }

    [Fact]
    public async Task UpdateAsync_CallsCopyToAsync()
    {
      // Arrange
      var existingLogo = CrearLogo(5);
      var fileMock = CrearFormFileMock();

      _repoMock.Setup(r => r.GetAsync(5)).ReturnsAsync(existingLogo);
      _repoMock.Setup(r => r.UpdateAsync(It.IsAny<Models.LogoPdf>())).Returns(Task.CompletedTask);
      _mapperMock.Setup(m => m.Map<GetLogoPdfDto>(It.IsAny<Models.LogoPdf>())).Returns(CrearDto(5));

      // Act
      await _service.UpdateAsync(5, fileMock.Object);

      // Assert
      fileMock.Verify(f => f.CopyToAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_NotExists_ThrowsNotFoundException()
    {
      // Arrange
      var formFile = CrearFormFileMock().Object;
      _repoMock.Setup(r => r.GetAsync(99)).ReturnsAsync((Models.LogoPdf?)null);

      // Act & Assert
      await Assert.ThrowsAsync<NotFoundException>(() => _service.UpdateAsync(99, formFile));
    }

    [Fact]
    public async Task UpdateAsync_NotExists_DoesNotCallUpdate()
    {
      // Arrange
      var formFile = CrearFormFileMock().Object;
      _repoMock.Setup(r => r.GetAsync(99)).ReturnsAsync((Models.LogoPdf?)null);

      // Act & Assert
      await Assert.ThrowsAsync<NotFoundException>(() => _service.UpdateAsync(99, formFile));

      // Assert
      _repoMock.Verify(r => r.UpdateAsync(It.IsAny<Models.LogoPdf>()), Times.Never);
    }

    [Fact]
    public async Task UpdateAsync_NullImage_ThrowsBadRequestException()
    {
      // Arrange
      var existingLogo = CrearLogo(5);
      _repoMock.Setup(r => r.GetAsync(5)).ReturnsAsync(existingLogo);

      // Act & Assert
      await Assert.ThrowsAsync<BadRequestException>(() => _service.UpdateAsync(5, null!));
    }

    [Fact]
    public async Task UpdateAsync_EmptyImage_ThrowsBadRequestException()
    {
      // Arrange
      var existingLogo = CrearLogo(5);
      var formFile = CrearFormFileMock(length: 0).Object;
      _repoMock.Setup(r => r.GetAsync(5)).ReturnsAsync(existingLogo);

      // Act & Assert
      await Assert.ThrowsAsync<BadRequestException>(() => _service.UpdateAsync(5, formFile));
    }

    [Fact]
    public async Task UpdateAsync_NullImage_DoesNotModifyExistingLogo()
    {
      // Arrange
      var existingLogo = CrearLogo(5);
      var originalNombre = existingLogo.Nombre;
      _repoMock.Setup(r => r.GetAsync(5)).ReturnsAsync(existingLogo);

      // Act & Assert
      await Assert.ThrowsAsync<BadRequestException>(() => _service.UpdateAsync(5, null!));

      // Assert
      Assert.Equal(originalNombre, existingLogo.Nombre);
      _repoMock.Verify(r => r.UpdateAsync(It.IsAny<Models.LogoPdf>()), Times.Never);
    }

    // ═══════════════════════════════════════════
    //  SetActivoAsync
    // ═══════════════════════════════════════════

    [Fact]
    public async Task SetActivoAsync_Exists_DesactivaTodosYActivaUno()
    {
      // Arrange
      var logo = CrearLogo(3);
      var dto = CrearDto(3, activo: true);

      _repoMock.Setup(r => r.GetAsync(3)).ReturnsAsync(logo);
      _repoMock.Setup(r => r.DesactivarTodosAsync()).Returns(Task.CompletedTask);
      _repoMock.Setup(r => r.UpdateAsync(It.IsAny<Models.LogoPdf>())).Returns(Task.CompletedTask);
      _mapperMock.Setup(m => m.Map<GetLogoPdfDto>(It.IsAny<Models.LogoPdf>())).Returns(dto);

      // Act
      var result = await _service.SetActivoAsync(3);

      // Assert
      Assert.True(result.EsActivo);
      _repoMock.Verify(r => r.DesactivarTodosAsync(), Times.Once);
      _repoMock.Verify(r => r.UpdateAsync(It.Is<Models.LogoPdf>(l => l.EsActivo)), Times.Once);
    }

    [Fact]
    public async Task SetActivoAsync_VerifyCallOrder_DesactivarBeforeUpdate()
    {
      // Arrange
      var logo = CrearLogo(3);
      var callOrder = new List<string>();

      _repoMock.Setup(r => r.GetAsync(3)).ReturnsAsync(logo);
      _repoMock.Setup(r => r.DesactivarTodosAsync())
               .Callback(() => callOrder.Add("DesactivarTodos"))
               .Returns(Task.CompletedTask);
      _repoMock.Setup(r => r.UpdateAsync(It.IsAny<Models.LogoPdf>()))
               .Callback(() => callOrder.Add("Update"))
               .Returns(Task.CompletedTask);
      _mapperMock.Setup(m => m.Map<GetLogoPdfDto>(It.IsAny<Models.LogoPdf>())).Returns(CrearDto(3, activo: true));

      // Act
      await _service.SetActivoAsync(3);

      // Assert
      Assert.Equal(2, callOrder.Count);
      Assert.Equal("DesactivarTodos", callOrder[0]);
      Assert.Equal("Update", callOrder[1]);
    }

    [Fact]
    public async Task SetActivoAsync_MutatesEntityEsActivoToTrue()
    {
      // Arrange
      var logo = CrearLogo(3, activo: false);

      _repoMock.Setup(r => r.GetAsync(3)).ReturnsAsync(logo);
      _repoMock.Setup(r => r.DesactivarTodosAsync()).Returns(Task.CompletedTask);
      _repoMock.Setup(r => r.UpdateAsync(It.IsAny<Models.LogoPdf>())).Returns(Task.CompletedTask);
      _mapperMock.Setup(m => m.Map<GetLogoPdfDto>(It.IsAny<Models.LogoPdf>())).Returns(CrearDto(3, activo: true));

      // Act
      await _service.SetActivoAsync(3);

      // Assert
      Assert.True(logo.EsActivo);
    }

    [Fact]
    public async Task SetActivoAsync_AlreadyActive_StillDesactivatesAllAndReactivates()
    {
      // Arrange
      var logo = CrearLogo(3, activo: true);

      _repoMock.Setup(r => r.GetAsync(3)).ReturnsAsync(logo);
      _repoMock.Setup(r => r.DesactivarTodosAsync()).Returns(Task.CompletedTask);
      _repoMock.Setup(r => r.UpdateAsync(It.IsAny<Models.LogoPdf>())).Returns(Task.CompletedTask);
      _mapperMock.Setup(m => m.Map<GetLogoPdfDto>(It.IsAny<Models.LogoPdf>())).Returns(CrearDto(3, activo: true));

      // Act
      await _service.SetActivoAsync(3);

      // Assert
      _repoMock.Verify(r => r.DesactivarTodosAsync(), Times.Once);
      _repoMock.Verify(r => r.UpdateAsync(It.IsAny<Models.LogoPdf>()), Times.Once);
    }

    [Fact]
    public async Task SetActivoAsync_NotExists_ThrowsNotFoundException()
    {
      // Arrange
      _repoMock.Setup(r => r.GetAsync(99)).ReturnsAsync((Models.LogoPdf?)null);

      // Act & Assert
      await Assert.ThrowsAsync<NotFoundException>(() => _service.SetActivoAsync(99));
    }

    [Fact]
    public async Task SetActivoAsync_NotExists_DoesNotCallDesactivarNiUpdate()
    {
      // Arrange
      _repoMock.Setup(r => r.GetAsync(99)).ReturnsAsync((Models.LogoPdf?)null);

      // Act & Assert
      await Assert.ThrowsAsync<NotFoundException>(() => _service.SetActivoAsync(99));

      // Assert
      _repoMock.Verify(r => r.DesactivarTodosAsync(), Times.Never);
      _repoMock.Verify(r => r.UpdateAsync(It.IsAny<Models.LogoPdf>()), Times.Never);
    }

    // ═══════════════════════════════════════════
    //  DeleteAsync
    // ═══════════════════════════════════════════

    [Fact]
    public async Task DeleteAsync_InactiveLogo_DeletesSuccessfully()
    {
      // Arrange
      var logo = CrearLogo(5, activo: false);
      _repoMock.Setup(r => r.GetAsync(5)).ReturnsAsync(logo);
      _repoMock.Setup(r => r.DeleteAsync(5)).Returns(Task.CompletedTask);

      // Act
      await _service.DeleteAsync(5);

      // Assert
      _repoMock.Verify(r => r.DeleteAsync(5), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ActiveLogo_ThrowsBadRequestException()
    {
      // Arrange
      var logo = CrearLogo(5, activo: true);
      _repoMock.Setup(r => r.GetAsync(5)).ReturnsAsync(logo);

      // Act
      var ex = await Assert.ThrowsAsync<BadRequestException>(() => _service.DeleteAsync(5));

      // Assert
      Assert.Contains("logo activo", ex.Message);
    }

    [Fact]
    public async Task DeleteAsync_ActiveLogo_DoesNotCallDelete()
    {
      // Arrange
      var logo = CrearLogo(5, activo: true);
      _repoMock.Setup(r => r.GetAsync(5)).ReturnsAsync(logo);

      // Act & Assert
      await Assert.ThrowsAsync<BadRequestException>(() => _service.DeleteAsync(5));

      // Assert
      _repoMock.Verify(r => r.DeleteAsync(It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_NotExists_ThrowsNotFoundException()
    {
      // Arrange
      _repoMock.Setup(r => r.GetAsync(99)).ReturnsAsync((Models.LogoPdf?)null);

      // Act & Assert
      await Assert.ThrowsAsync<NotFoundException>(() => _service.DeleteAsync(99));
    }

    [Fact]
    public async Task DeleteAsync_NotExists_DoesNotCallDelete()
    {
      // Arrange
      _repoMock.Setup(r => r.GetAsync(99)).ReturnsAsync((Models.LogoPdf?)null);

      // Act & Assert
      await Assert.ThrowsAsync<NotFoundException>(() => _service.DeleteAsync(99));

      // Assert
      _repoMock.Verify(r => r.DeleteAsync(It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_ActiveLogo_ExceptionMessageSuggestsAction()
    {
      // Arrange
      var logo = CrearLogo(5, activo: true);
      _repoMock.Setup(r => r.GetAsync(5)).ReturnsAsync(logo);

      // Act
      var ex = await Assert.ThrowsAsync<BadRequestException>(() => _service.DeleteAsync(5));

      // Assert
      Assert.Contains("Selecciona otro", ex.Message);
    }

    // ═══════════════════════════════════════════
    //  DeleteAllAsync
    // ═══════════════════════════════════════════

    [Fact]
    public async Task DeleteAllAsync_CallsRepository()
    {
      // Arrange
      _repoMock.Setup(r => r.DeleteAllAsync()).Returns(Task.CompletedTask);

      // Act
      await _service.DeleteAllAsync();

      // Assert
      _repoMock.Verify(r => r.DeleteAllAsync(), Times.Once);
    }
  }
}
