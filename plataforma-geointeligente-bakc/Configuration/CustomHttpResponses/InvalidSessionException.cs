namespace SaludPublicaBackend.Configurations.CustomHttpResponses
{
  public class InvalidSessionException : ApplicationException
  {
    public InvalidSessionException(string message) : base(message)
    {
    }
  }
}