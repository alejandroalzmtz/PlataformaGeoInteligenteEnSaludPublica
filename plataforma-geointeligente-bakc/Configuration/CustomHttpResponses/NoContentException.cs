namespace SaludPublicaBackend.Configurations.CustomHttpResponses
{
  public class NoContentException : ApplicationException
  {
    public NoContentException(string message) : base(message)
    {
    }

    public NoContentException(string item, object key) : base(
      $"(Consulta exitosa, pero no se ha encontrado {item} con id ({key}) en la base de datos")
    {
    }
  }
}