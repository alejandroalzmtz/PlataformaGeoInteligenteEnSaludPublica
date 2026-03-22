namespace SaludPublicaBackend.Configurations.CustomHttpResponses;
public class BadRequestException : ApplicationException
{
  public BadRequestException(string message) : base(message)
  {
  }
}