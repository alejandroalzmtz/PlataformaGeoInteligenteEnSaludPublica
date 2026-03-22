using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace SaludPublicaBackend.Configurations.CustomHttpResponses;

public class ExceptionsMiddleware
{
  private readonly RequestDelegate _next;
  private readonly ILogger<ExceptionsMiddleware> _logger;

  public ExceptionsMiddleware(RequestDelegate next, ILogger<ExceptionsMiddleware> logger)
  {
    _next = next;
    _logger = logger;
  }

  public async Task InvokeAsync(HttpContext context)
  {
    try
    {
      await _next(context);
    }
    catch (Exception ex)
    {
      // Log the exception with full details
      _logger.LogError(ex, "Unhandled exception occurred. Path: {Path}, Method: {Method}", 
        context.Request.Path, context.Request.Method);
      await HandleExceptionAsync(context, ex);
    }
  }

  private Task HandleExceptionAsync(HttpContext context, Exception ex)
  {
    // If response has already started, we can't modify status code or headers
    if (context.Response.HasStarted)
    {
      _logger.LogWarning("Cannot handle exception, response has already started");
      return Task.CompletedTask;
    }

    var statusCode = StatusCodes.Status500InternalServerError;

    var errorDetails = new ErrorMessage
    {
      Success = false,
      StatusCode = StatusCodes.Status500InternalServerError,
      Message = ex.Message
    };

    switch (ex)
    {
      case NoContentException noContentException:
        statusCode = StatusCodes.Status204NoContent;
        errorDetails.Success = true;
        errorDetails.StatusCode = StatusCodes.Status204NoContent;
        errorDetails.Message = ex.Message;
        break;
      case NotFoundException notFoundException:
        statusCode = StatusCodes.Status404NotFound;
        errorDetails.Success = true;
        errorDetails.StatusCode = StatusCodes.Status404NotFound;
        errorDetails.Message = ex.Message;
        break;
      case UnauthorizedException unauthorizedException:
        statusCode = StatusCodes.Status401Unauthorized;
        errorDetails.Success = false;
        errorDetails.StatusCode = StatusCodes.Status401Unauthorized;
        errorDetails.Message = ex.Message;
        break;
      case BadRequestException badRequestException:
        statusCode = StatusCodes.Status400BadRequest;
        errorDetails.Success = false;
        errorDetails.StatusCode = StatusCodes.Status400BadRequest;
        errorDetails.Message = ex.Message;
        break;
      case ValidationException validationException:
        statusCode = StatusCodes.Status400BadRequest;
        errorDetails.Message = validationException.Message;
        break;
      case InvalidSessionException invalidSessionException:
        statusCode = StatusCodes.Status200OK;
        errorDetails.Success = false;
        errorDetails.StatusCode = StatusCodes.Status200OK;
        errorDetails.Message = invalidSessionException.Message;
        break;
      case ValidSessionException validSessionException:
        statusCode = StatusCodes.Status200OK;
        errorDetails.Success = true;
        errorDetails.StatusCode = StatusCodes.Status200OK;
        errorDetails.Message = validSessionException.Message;
        break;
        // case CantDeleteException cantDeleteException:
        //   statusCode = HttpStatusCode.BadRequest;
        //   errorDetails.ErrorType = "Bad Request";
        //   break;
        // case KeyValueDuplicateException keyValueDuplicateException:
        //   statusCode = HttpStatusCode.Conflict;
        //   errorDetails.ErrorType = "Key Value Duplicate";
        //   break;
        // default:
        //   break;
    }

    try
    {
      var response = JsonConvert.SerializeObject(errorDetails);
      context.Response.ContentType = "application/json";
      context.Response.StatusCode = statusCode;

      return context.Response.WriteAsync(response);
    }
    catch (Exception writeEx)
    {
      _logger.LogError(writeEx, "Error writing exception response");
      return Task.CompletedTask;
    }
  }
}

public class ErrorMessage
{
  public bool Success { get; set; }
  public int? StatusCode { get; set; }
  public string? Message { get; set; }
}