namespace SaludPublicaBackend.Configurations.CustomHttpResponses
{
  public class DataBaseException : ApplicationException
  {
    public DataBaseException(string action, string exception) : base(
      $"No se pudo {action} por lo siguiente: ({exception})")
    {
    }

    public DataBaseException(string exception) : base($"Ocurrió un error: ({exception})")
    {
    }
  }
}