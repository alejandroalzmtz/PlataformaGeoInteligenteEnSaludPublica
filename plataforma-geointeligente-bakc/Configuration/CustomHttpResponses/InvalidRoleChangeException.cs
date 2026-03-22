namespace SaludPublicaBackend.Configurations.CustomHttpResponses
{
  public class InvalidRoleChangeException : InvalidOperationException
  {
    public InvalidRoleChangeException() : base("Operación no válida.")
    {
    }

    public InvalidRoleChangeException(string message) : base(message)
    {
    }

    public InvalidRoleChangeException(string message, Exception innerException) : base(message, innerException)
    {
    }
  }
}