namespace SaludPublicaBackend.Configurations.CustomHttpResponses;

public class CantDeleteException : ApplicationException
{
  public CantDeleteException(string message, int total) : base(message + total)
  {
  }

  public CantDeleteException(string message) : base(message)
  {
  }
}