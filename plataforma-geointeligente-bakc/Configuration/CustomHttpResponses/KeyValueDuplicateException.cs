namespace SaludPublicaBackend.Configurations.CustomHttpResponses
{
  public class KeyValueDuplicateException : ApplicationException
  {
    public KeyValueDuplicateException(string name, object key) : base(
      $"The {name} with the value of ({key}) already exists")
    {
    }

    public KeyValueDuplicateException(string message) : base(message)
    {
    }
  }
}