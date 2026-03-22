using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using SaludPublicaBackend.Configurations.CustomHttpResponses;
using SaludPublicaBackend.Controllers;
using SaludPublicaBackend.Dtos.LogoPdfDto;
using SaludPublicaBackend.Services.LogoPdfService;

namespace SaludPublicaBackend.Tests.LogoPdf
{
  public class LogoPdfControllerTests
  {
    private readonly Mock<ILogoPdfService> _serviceMock;
    private readonly LogoPdfController _controller;

    public LogoPdfControllerTests()
    {
      _serviceMock = new Mock<ILogoPdfService>();
      _controller = new LogoPdfController(_serviceMock.Object);
    }

    // ────────── Helper ──────────

    private static GetLogoPdfDto CrearDto(int id = 1, bool activo = false)
    {
      return new GetLogoPdfDto
      {
        IdLogo = id,
        Nombre = $"logo_{id}.png",
        Formato = "PNG",
        Tamanio = 1024,
        FechaSubida = new DateTime(2024, 1, 1),
        EsActivo = activo,
        ImagenUrl = $"/api/LogoPdf/{id}/imagen"
      };
    }

    private static Mock<IFormFile> CrearFormFileMock()
    {
      var fileMock = new Mock<IFormFile>();
      fileMock.Setup(f => f.FileName).Returns("test.png");
      fileMock.Setup(f => f.ContentType).Returns("image/png");
      fileMock.Setup(f => f.Length).Returns(100);
      return fileMock;
    }

    // ═══════════════════════════════════════════
    //  GetAll
    // ═══════════════════════════════════════════

    [Fact]
    public async Task GetAll_ReturnsOkWithList()
    {
      // Arrange
      var dtos = new List<GetLogoPdfDto> { CrearDto(1), CrearDto(2) };
      _serviceMock.Setup(s => s.GetAllAsync()).ReturnsAsync(dtos);

      // Act
      var result = await _controller.GetAll();

      // Assert
      var okResult = Assert.IsType<OkObjectResult>(result.Result);
      var value = Assert.IsAssignableFrom<IEnumerable<GetLogoPdfDto>>(okResult.Value);
      Assert.Equal(2, value.Count());
    }

    [Fact]
    public async Task GetAll_EmptyList_ReturnsOkWithEmpty()
    {
      // Arrange
      _serviceMock.Setup(s => s.GetAllAsync()).ReturnsAsync(new List<GetLogoPdfDto>());

      // Act
      var result = await _controller.GetAll();

      // Assert
      var okResult = Assert.IsType<OkObjectResult>(result.Result);
      var value = Assert.IsAssignableFrom<IEnumerable<GetLogoPdfDto>>(okResult.Value);
      Assert.Empty(value);
    }

    [Fact]
    public async Task GetAll_ReturnsStatus200()
    {
      // Arrange
      _serviceMock.Setup(s => s.GetAllAsync()).ReturnsAsync(new List<GetLogoPdfDto>());

      // Act
      var result = await _controller.GetAll();

      // Assert
      var okResult = Assert.IsType<OkObjectResult>(result.Result);
      Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
    }

    // ═══════════════════════════════════════════
    //  GetActivo
    // ═══════════════════════════════════════════

    [Fact]
    public async Task GetActivo_ReturnsOkWithDto()
    {
      // Arrange
      var dto = CrearDto(1, activo: true);
      _serviceMock.Setup(s => s.GetActivoAsync()).ReturnsAsync(dto);

      // Act
      var result = await _controller.GetActivo();

      // Assert
      var okResult = Assert.IsType<OkObjectResult>(result.Result);
      var value = Assert.IsType<GetLogoPdfDto>(okResult.Value);
      Assert.True(value.EsActivo);
    }

    [Fact]
    public async Task GetActivo_ServiceThrowsNotFound_ExceptionPropagates()
    {
      // Arrange
      _serviceMock.Setup(s => s.GetActivoAsync())
                  .ThrowsAsync(new NotFoundException("No hay logo activo configurado"));

      // Act & Assert
      await Assert.ThrowsAsync<NotFoundException>(() => _controller.GetActivo());
    }

    // ═══════════════════════════════════════════
    //  GetById
    // ═══════════════════════════════════════════

    [Fact]
    public async Task GetById_ReturnsOkWithDto()
    {
      // Arrange
      var dto = CrearDto(5);
      _serviceMock.Setup(s => s.GetByIdAsync(5)).ReturnsAsync(dto);

      // Act
      var result = await _controller.GetById(5);

      // Assert
      var okResult = Assert.IsType<OkObjectResult>(result.Result);
      var value = Assert.IsType<GetLogoPdfDto>(okResult.Value);
      Assert.Equal(5, value.IdLogo);
    }

    [Fact]
    public async Task GetById_ServiceThrowsNotFound_ExceptionPropagates()
    {
      // Arrange
      _serviceMock.Setup(s => s.GetByIdAsync(99))
                  .ThrowsAsync(new NotFoundException("LogoPdf", 99));

      // Act & Assert
      await Assert.ThrowsAsync<NotFoundException>(() => _controller.GetById(99));
    }

    // ═══════════════════════════════════════════
    //  GetImagen
    // ═══════════════════════════════════════════

    [Fact]
    public async Task GetImagen_ReturnsFileResult()
    {
      // Arrange
      var imageBytes = new byte[] { 0x89, 0x50, 0x4E, 0x47 };
      _serviceMock.Setup(s => s.GetImagenAsync(3))
                  .ReturnsAsync((imageBytes, "PNG"));

      // Act
      var result = await _controller.GetImagen(3);

      // Assert
      var fileResult = Assert.IsType<FileContentResult>(result);
      Assert.Equal("image/png", fileResult.ContentType);
      Assert.Equal(imageBytes, fileResult.FileContents);
    }

    [Fact]
    public async Task GetImagen_JPEG_ReturnsCorrectContentType()
    {
      // Arrange
      var imageBytes = new byte[] { 0xFF, 0xD8, 0xFF };
      _serviceMock.Setup(s => s.GetImagenAsync(3))
                  .ReturnsAsync((imageBytes, "JPEG"));

      // Act
      var result = await _controller.GetImagen(3);

      // Assert
      var fileResult = Assert.IsType<FileContentResult>(result);
      Assert.Equal("image/jpeg", fileResult.ContentType);
    }

    // ═══════════════════════════════════════════
    //  GetImagenActivo
    // ═══════════════════════════════════════════

    [Fact]
    public async Task GetImagenActivo_ReturnsFileResult()
    {
      // Arrange
      var imageBytes = new byte[] { 0x89, 0x50, 0x4E, 0x47 };
      _serviceMock.Setup(s => s.GetImagenActivoAsync())
                  .ReturnsAsync((imageBytes, "PNG"));

      // Act
      var result = await _controller.GetImagenActivo();

      // Assert
      var fileResult = Assert.IsType<FileContentResult>(result);
      Assert.Equal("image/png", fileResult.ContentType);
    }

    [Fact]
    public async Task GetImagenActivo_JPEG_ReturnsCorrectContentType()
    {
      // Arrange
      var imageBytes = new byte[] { 0xFF, 0xD8, 0xFF };
      _serviceMock.Setup(s => s.GetImagenActivoAsync())
                  .ReturnsAsync((imageBytes, "JPEG"));

      // Act
      var result = await _controller.GetImagenActivo();

      // Assert
      var fileResult = Assert.IsType<FileContentResult>(result);
      Assert.Equal("image/jpeg", fileResult.ContentType);
    }

    [Fact]
    public async Task GetImagenActivo_ServiceThrowsNotFound_ExceptionPropagates()
    {
      // Arrange
      _serviceMock.Setup(s => s.GetImagenActivoAsync())
                  .ThrowsAsync(new NotFoundException("No hay logo activo configurado"));

      // Act & Assert
      await Assert.ThrowsAsync<NotFoundException>(() => _controller.GetImagenActivo());
    }

    [Fact]
    public async Task GetImagen_ServiceThrowsNotFound_ExceptionPropagates()
    {
      // Arrange
      _serviceMock.Setup(s => s.GetImagenAsync(99))
                  .ThrowsAsync(new NotFoundException("LogoPdf", 99));

      // Act & Assert
      await Assert.ThrowsAsync<NotFoundException>(() => _controller.GetImagen(99));
    }

    [Fact]
    public async Task GetImagen_UnknownFormat_DefaultsToJpegContentType()
    {
      // Arrange
      var imageBytes = new byte[] { 0x01, 0x02 };
      _serviceMock.Setup(s => s.GetImagenAsync(1))
                  .ReturnsAsync((imageBytes, "WEBP"));

      // Act
      var result = await _controller.GetImagen(1);

      // Assert
      var fileResult = Assert.IsType<FileContentResult>(result);
      Assert.Equal("image/jpeg", fileResult.ContentType);
    }

    // ═══════════════════════════════════════════
    //  GetActivoDataUrl
    // ═══════════════════════════════════════════

    [Fact]
    public async Task GetActivoDataUrl_ReturnsOkWithAnonymousObject()
    {
      // Arrange
      _serviceMock.Setup(s => s.GetActivoDataUrlAsync())
                  .ReturnsAsync(("data:image/png;base64,abc123", "PNG"));

      // Act
      var result = await _controller.GetActivoDataUrl();

      // Assert
      var okResult = Assert.IsType<OkObjectResult>(result);
      Assert.NotNull(okResult.Value);

      var type = okResult.Value!.GetType();
      var dataUrlProp = type.GetProperty("dataUrl");
      var formatProp = type.GetProperty("format");

      Assert.NotNull(dataUrlProp);
      Assert.NotNull(formatProp);
      Assert.Equal("data:image/png;base64,abc123", dataUrlProp!.GetValue(okResult.Value));
      Assert.Equal("PNG", formatProp!.GetValue(okResult.Value));
    }

    // ═══════════════════════════════════════════
    //  Create
    // ═══════════════════════════════════════════

    [Fact]
    public async Task Create_ReturnsCreatedAtAction()
    {
      // Arrange
      var dto = CrearDto(10);
      var formFile = CrearFormFileMock().Object;
      _serviceMock.Setup(s => s.CreateAsync(formFile)).ReturnsAsync(dto);

      // Act
      var result = await _controller.Create(formFile);

      // Assert
      var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
      Assert.Equal(nameof(LogoPdfController.GetById), createdResult.ActionName);
      Assert.Equal(StatusCodes.Status201Created, createdResult.StatusCode);

      var value = Assert.IsType<GetLogoPdfDto>(createdResult.Value);
      Assert.Equal(10, value.IdLogo);
      Assert.Equal(10, createdResult.RouteValues!["id"]);
    }

    [Fact]
    public async Task Create_ServiceThrowsBadRequest_ExceptionPropagates()
    {
      // Arrange
      var formFile = CrearFormFileMock().Object;
      _serviceMock.Setup(s => s.CreateAsync(formFile))
                  .ThrowsAsync(new BadRequestException("No se proporcionó una imagen válida"));

      // Act & Assert
      await Assert.ThrowsAsync<BadRequestException>(() => _controller.Create(formFile));
    }

    // ═══════════════════════════════════════════
    //  Update
    // ═══════════════════════════════════════════

    [Fact]
    public async Task Update_ReturnsOkWithUpdatedDto()
    {
      // Arrange
      var dto = CrearDto(5);
      var formFile = CrearFormFileMock().Object;
      _serviceMock.Setup(s => s.UpdateAsync(5, formFile)).ReturnsAsync(dto);

      // Act
      var result = await _controller.Update(5, formFile);

      // Assert
      var okResult = Assert.IsType<OkObjectResult>(result.Result);
      var value = Assert.IsType<GetLogoPdfDto>(okResult.Value);
      Assert.Equal(5, value.IdLogo);
    }

    [Fact]
    public async Task Update_ServiceThrowsNotFound_ExceptionPropagates()
    {
      // Arrange
      var formFile = CrearFormFileMock().Object;
      _serviceMock.Setup(s => s.UpdateAsync(99, formFile))
                  .ThrowsAsync(new NotFoundException("LogoPdf", 99));

      // Act & Assert
      await Assert.ThrowsAsync<NotFoundException>(() => _controller.Update(99, formFile));
    }

    [Fact]
    public async Task Update_ServiceThrowsBadRequest_ExceptionPropagates()
    {
      // Arrange
      var formFile = CrearFormFileMock().Object;
      _serviceMock.Setup(s => s.UpdateAsync(5, formFile))
                  .ThrowsAsync(new BadRequestException("No se proporcionó una imagen válida"));

      // Act & Assert
      await Assert.ThrowsAsync<BadRequestException>(() => _controller.Update(5, formFile));
    }

    // ═══════════════════════════════════════════
    //  SetActivo
    // ═══════════════════════════════════════════

    [Fact]
    public async Task SetActivo_ReturnsOkWithDto()
    {
      // Arrange
      var dto = CrearDto(3, activo: true);
      _serviceMock.Setup(s => s.SetActivoAsync(3)).ReturnsAsync(dto);

      // Act
      var result = await _controller.SetActivo(3);

      // Assert
      var okResult = Assert.IsType<OkObjectResult>(result.Result);
      var value = Assert.IsType<GetLogoPdfDto>(okResult.Value);
      Assert.True(value.EsActivo);
    }

    // ═══════════════════════════════════════════
    //  Delete
    // ═══════════════════════════════════════════

    [Fact]
    public async Task Delete_ReturnsNoContent()
    {
      // Arrange
      _serviceMock.Setup(s => s.DeleteAsync(5)).Returns(Task.CompletedTask);

      // Act
      var result = await _controller.Delete(5);

      // Assert
      Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_ServiceThrowsNotFound_ExceptionPropagates()
    {
      // Arrange
      _serviceMock.Setup(s => s.DeleteAsync(99))
                  .ThrowsAsync(new NotFoundException("LogoPdf", 99));

      // Act & Assert
      await Assert.ThrowsAsync<NotFoundException>(() => _controller.Delete(99));
    }

    [Fact]
    public async Task Delete_ServiceThrowsBadRequest_ExceptionPropagates()
    {
      // Arrange
      _serviceMock.Setup(s => s.DeleteAsync(5))
                  .ThrowsAsync(new BadRequestException("No puedes eliminar el logo activo."));

      // Act & Assert
      await Assert.ThrowsAsync<BadRequestException>(() => _controller.Delete(5));
    }

    // ═══════════════════════════════════════════
    //  DeleteAll
    // ═══════════════════════════════════════════

    [Fact]
    public async Task DeleteAll_ReturnsNoContent()
    {
      // Arrange
      _serviceMock.Setup(s => s.DeleteAllAsync()).Returns(Task.CompletedTask);

      // Act
      var result = await _controller.DeleteAll();

      // Assert
      Assert.IsType<NoContentResult>(result);
    }

    // ═══════════════════════════════════════════
    //  Verificar que el servicio se invoca
    // ═══════════════════════════════════════════

    [Fact]
    public async Task AllEndpoints_DelegateToService()
    {
      // Arrange
      var dto = CrearDto();
      var dtos = new List<GetLogoPdfDto> { dto };
      var imageBytes = new byte[] { 1, 2, 3 };
      var formFile = CrearFormFileMock().Object;

      _serviceMock.Setup(s => s.GetAllAsync()).ReturnsAsync(dtos);
      _serviceMock.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(dto);
      _serviceMock.Setup(s => s.GetActivoAsync()).ReturnsAsync(dto);
      _serviceMock.Setup(s => s.GetImagenAsync(1)).ReturnsAsync((imageBytes, "PNG"));
      _serviceMock.Setup(s => s.GetImagenActivoAsync()).ReturnsAsync((imageBytes, "PNG"));
      _serviceMock.Setup(s => s.GetActivoDataUrlAsync()).ReturnsAsync(("data:image/png;base64,x", "PNG"));
      _serviceMock.Setup(s => s.CreateAsync(formFile)).ReturnsAsync(dto);
      _serviceMock.Setup(s => s.UpdateAsync(1, formFile)).ReturnsAsync(dto);
      _serviceMock.Setup(s => s.SetActivoAsync(1)).ReturnsAsync(dto);
      _serviceMock.Setup(s => s.DeleteAsync(1)).Returns(Task.CompletedTask);
      _serviceMock.Setup(s => s.DeleteAllAsync()).Returns(Task.CompletedTask);

      // Act
      await _controller.GetAll();
      await _controller.GetById(1);
      await _controller.GetActivo();
      await _controller.GetImagen(1);
      await _controller.GetImagenActivo();
      await _controller.GetActivoDataUrl();
      await _controller.Create(formFile);
      await _controller.Update(1, formFile);
      await _controller.SetActivo(1);
      await _controller.Delete(1);
      await _controller.DeleteAll();

      // Assert
      _serviceMock.Verify(s => s.GetAllAsync(), Times.Once);
      _serviceMock.Verify(s => s.GetByIdAsync(1), Times.Once);
      _serviceMock.Verify(s => s.GetActivoAsync(), Times.Once);
      _serviceMock.Verify(s => s.GetImagenAsync(1), Times.Once);
      _serviceMock.Verify(s => s.GetImagenActivoAsync(), Times.Once);
      _serviceMock.Verify(s => s.GetActivoDataUrlAsync(), Times.Once);
      _serviceMock.Verify(s => s.CreateAsync(formFile), Times.Once);
      _serviceMock.Verify(s => s.UpdateAsync(1, formFile), Times.Once);
      _serviceMock.Verify(s => s.SetActivoAsync(1), Times.Once);
      _serviceMock.Verify(s => s.DeleteAsync(1), Times.Once);
      _serviceMock.Verify(s => s.DeleteAllAsync(), Times.Once);
    }
  }
}
