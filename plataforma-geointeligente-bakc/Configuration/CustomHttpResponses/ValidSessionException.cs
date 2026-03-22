namespace SaludPublicaBackend.Configurations.CustomHttpResponses
{
  public class ValidSessionException : ApplicationException
  {
    public ValidSessionException(string message) : base(message)
    {
    }
  }
}