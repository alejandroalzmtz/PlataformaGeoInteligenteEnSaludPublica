namespace SaludPublicaBackend.Utils.Validations
{
  public static class DatabaseResultsValidations
  {
    public static bool IsDifferentToNull<T>(this T obj)
    {
      if (obj == null)
        return false;

      var properties = obj.GetType().GetProperties();
      return properties.Any(prop => prop.GetValue(obj) != null);
    }
  }
}