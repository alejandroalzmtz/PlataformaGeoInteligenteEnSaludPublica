using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using SaludPublicaBackend.Configurations.Databases;
using SaludPublicaBackend.Models;
using System.Data;
using System.Globalization;
using System.Text;

namespace SaludPublicaBackend.Repositories.ImportacionRepository
{
  public class ImportacionRepository : IImportacionRepository
  {
    private readonly AppDbContext _dbContext;

    public ImportacionRepository(AppDbContext dbContext)
    {
      _dbContext = dbContext;
    }

    public async Task<(int inserted, int skipped)> ImportRegistroMedicoCsvAsync(Stream csvStream, CancellationToken cancellationToken)
    {
      // Cabeceras esperadas (sin idRegistro; se asume identidad/autonumérico)
      var expected = new[]
      {
        "fechaIngreso","fechaEgreso","idEstado","idMunicipio","idLoc","edad","idSexo",
        "idDerechoHab","idServicioIngreso","idServicioEgreso","idProcedencia","idMotivoEgreso",
        "idEnfermedad"
      };

      var entityType = _dbContext.Model.FindEntityType(typeof(RegistroMedico))
                       ?? throw new InvalidOperationException("No se encontró la entidad RegistroMedico en el modelo.");
      var schema = entityType.GetSchema() ?? "dbo";
      var tableName = entityType.GetTableName()
                      ?? throw new InvalidOperationException("No se encontró el nombre de tabla de RegistroMedico.");

      var batchSize = 10_000; // Ajustable
      var inserted = 0;
      var skipped = 0;
      var lineNumber = 0;

      // DataTable con columnas mapeadas a la tabla (sin idRegistro)
      var table = new DataTable();
      table.Columns.Add("fechaIngreso", typeof(DateTime));
      table.Columns.Add("fechaEgreso", typeof(DateTime));
      table.Columns.Add("diasEstancia", typeof(int));
      table.Columns.Add("idEstado", typeof(int));
      table.Columns.Add("idMunicipio", typeof(int));
      table.Columns.Add("idLoc", typeof(int));
      table.Columns.Add("edad", typeof(int));
      table.Columns.Add("idSexo", typeof(int));
      table.Columns.Add("idDerechoHab", typeof(int));
      table.Columns.Add("idServicioIngreso", typeof(int));
      table.Columns.Add("idServicioEgreso", typeof(int));
      table.Columns.Add("idProcedencia", typeof(int));
      table.Columns.Add("idMotivoEgreso", typeof(int));
      table.Columns.Add("idEnfermedad", typeof(string));

      using var reader = new StreamReader(csvStream, Encoding.UTF8, detectEncodingFromByteOrderMarks: true);

      string? header = await reader.ReadLineAsync();
      lineNumber++;
      if (header == null)
        throw new InvalidOperationException("El archivo CSV está vacío.");

      var headerCols = SplitCsvLine(header).Select(h => h.Trim()).ToArray();
      if (!ValidateHeader(headerCols, expected, out var index))
        throw new InvalidOperationException($"Cabeceras inválidas. Se esperaban: {string.Join(",", expected)}");

      // Conexión a BD reutilizando la de EF Core
      var dbConn = (SqlConnection)_dbContext.Database.GetDbConnection();
      var mustOpen = dbConn.State != ConnectionState.Open;
      if (mustOpen) await dbConn.OpenAsync(cancellationToken);

      try
      {
        using var bulk = new SqlBulkCopy(dbConn, SqlBulkCopyOptions.TableLock, null)
        {
          DestinationTableName = $"[{schema}].[{tableName}]",
          BatchSize = batchSize,
          BulkCopyTimeout = 0 // sin límite
        };
        foreach (DataColumn col in table.Columns)
          bulk.ColumnMappings.Add(col.ColumnName, col.ColumnName);

        string? line;
        while ((line = await reader.ReadLineAsync()) != null)
        {
          cancellationToken.ThrowIfCancellationRequested();
          lineNumber++;
          if (string.IsNullOrWhiteSpace(line)) { skipped++; continue; }

          var cols = SplitCsvLine(line).ToArray();
          if (cols.Length < headerCols.Length) { skipped++; continue; }

          if (!TryParseRegistro(cols, index, out var rowValues))
          {
            skipped++;
            continue;
          }

          table.Rows.Add(rowValues);

          if (table.Rows.Count >= batchSize)
          {
            await bulk.WriteToServerAsync(table, cancellationToken);
            inserted += table.Rows.Count;
            table.Clear();
          }
        }

        if (table.Rows.Count > 0)
        {
          await bulk.WriteToServerAsync(table, cancellationToken);
          inserted += table.Rows.Count;
          table.Clear();
        }
      }
      finally
      {
        if (mustOpen) await dbConn.CloseAsync();
      }

      return (inserted, skipped);
    }

    // --- Helpers privados ---

    private static bool ValidateHeader(string[] header, string[] expected, out Dictionary<string, int> index)
    {
      index = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
      for (int i = 0; i < header.Length; i++)
        index[header[i]] = i;

      foreach (var h in expected)
        if (!index.ContainsKey(h)) return false;

      return true;
    }

    private static bool TryParseRegistro(string[] cols, Dictionary<string, int> idx, out object[] values)
    {
      values = Array.Empty<object>();

      if (!TryParseDate(cols[idx["fechaIngreso"]], out var fechaIngreso)) return false;
      if (!TryParseDate(cols[idx["fechaEgreso"]], out var fechaEgreso)) return false;

      var diasEstancia = Math.Max(0, (int)(fechaEgreso.Date - fechaIngreso.Date).TotalDays);

      if (!int.TryParse(cols[idx["idEstado"]], out var idEstado)) return false;
      if (!int.TryParse(cols[idx["idMunicipio"]], out var idMunicipio)) return false;
      if (!int.TryParse(cols[idx["idLoc"]], out var idLoc)) return false;
      if (!int.TryParse(cols[idx["edad"]], out var edad)) return false;
      if (!int.TryParse(cols[idx["idSexo"]], out var idSexo)) return false;
      if (!int.TryParse(cols[idx["idDerechoHab"]], out var idDerechoHab)) return false;
      if (!int.TryParse(cols[idx["idServicioIngreso"]], out var idServicioIngreso)) return false;
      if (!int.TryParse(cols[idx["idServicioEgreso"]], out var idServicioEgreso)) return false;
      if (!int.TryParse(cols[idx["idProcedencia"]], out var idProcedencia)) return false;
      if (!int.TryParse(cols[idx["idMotivoEgreso"]], out var idMotivoEgreso)) return false;

      var idEnfermedad = GetNullable(cols[idx["idEnfermedad"]]);

      values = new object[]
      {
        fechaIngreso, fechaEgreso, diasEstancia,
        idEstado, idMunicipio, idLoc, edad, idSexo, idDerechoHab,
        idServicioIngreso, idServicioEgreso, idProcedencia, idMotivoEgreso,
        (object?)idEnfermedad ?? DBNull.Value
      };
      return true;
    }

    private static string? GetNullable(string s)
      => string.IsNullOrWhiteSpace(s) ? null : s.Trim();

    private static bool TryParseDate(string s, out DateTime dt)
    {
      var formats = new[]
      {
        "yyyy-MM-dd","yyyy/MM/dd","dd/MM/yyyy","MM/dd/yyyy",
        "yyyy-MM-dd HH:mm:ss","yyyy/MM/dd HH:mm:ss","s"
      };
      return DateTime.TryParseExact(s.Trim(), formats, CultureInfo.InvariantCulture,
        DateTimeStyles.AssumeLocal | DateTimeStyles.AllowWhiteSpaces, out dt)
        || DateTime.TryParse(s, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out dt);
    }

    private static IEnumerable<string> SplitCsvLine(string line)
    {
      var result = new List<string>();
      var sb = new StringBuilder();
      bool inQuotes = false;

      for (int i = 0; i < line.Length; i++)
      {
        char c = line[i];

        if (c == '\"')
        {
          if (inQuotes && i + 1 < line.Length && line[i + 1] == '\"')
          {
            sb.Append('\"'); // escape ""
            i++;
          }
          else
          {
            inQuotes = !inQuotes;
          }
        }
        else if (c == ',' && !inQuotes)
        {
          result.Add(sb.ToString());
          sb.Clear();
        }
        else
        {
          sb.Append(c);
        }
      }

      result.Add(sb.ToString());
      return result;
    }
  }
}
