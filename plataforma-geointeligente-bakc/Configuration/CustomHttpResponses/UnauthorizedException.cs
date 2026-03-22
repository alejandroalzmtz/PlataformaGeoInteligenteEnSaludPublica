namespace SaludPublicaBackend.Configurations.CustomHttpResponses
{
  public class UnauthorizedException : ApplicationException
  {
    public UnauthorizedException(string message) : base(message)
    {
    }
  }
}