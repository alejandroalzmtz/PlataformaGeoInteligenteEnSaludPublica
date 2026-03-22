using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SaludPublicaBackend.Repositories.ImportacionRepository;
using System.Diagnostics;
using System.Text;
using System.Text.Json;

namespace SaludPublicaBackend.Services.ImportacionService
{
  public class ImportacionService : IImportacionService
  {
    private readonly IImportacionRepository _repo;
    private readonly IHostEnvironment _env;
    private readonly ILogger<ImportacionService> _logger;
    private readonly string? _pythonExePath;
    private readonly string _workingDirName;

    public ImportacionService(
      IImportacionRepository repo,
      IHostEnvironment env,
      ILogger<ImportacionService> logger,
      IConfiguration config)
    {
      _repo = repo;
      _env = env;
      _logger = logger;
      _pythonExePath = config["Python:ExePath"];
      _workingDirName = config["Python:WorkingDir"] ?? "python";
    }

    public async Task<(int inserted, int skipped, string cleanedFilePath, string transformedFilePath, string? pythonSummary)> ImportRegistroMedicoWithCleaningAsync(
      Stream uploadedCsv, string originalFileName, CancellationToken cancellationToken)
    {
      var contentRoot = _env.ContentRootPath ?? AppContext.BaseDirectory;
      var pythonDir = Path.Combine(contentRoot, _workingDirName);
      var scriptPath = Path.Combine(pythonDir, "limpieza.py");
      if (!File.Exists(scriptPath))
        throw new InvalidOperationException($"No se encontró el script: {scriptPath}");

      // Directorio de trabajo temporal único
      var workDir = Path.Combine(Path.GetTempPath(), $"pyclean_{Guid.NewGuid():N}");
      Directory.CreateDirectory(workDir);

      // Guardar el CSV con el NOMBRE ORIGINAL dentro del workDir
      var safeName = Path.GetFileName(originalFileName);
      var tempInPath = Path.Combine(workDir, safeName);

      // Usamos el mismo directorio temporal para la salida del script
      var tempOutDir = workDir;

      // Carpeta de referencias (si se usan CSVs de referencia)
      var refDir = Path.Combine(pythonDir, "Tablas de las FK");

      string cleanedFilePath = string.Empty;
      string transformedFilePath = string.Empty;

      try
      {
        await using (var fs = File.Create(tempInPath))
          await uploadedCsv.CopyToAsync(fs, cancellationToken);

        var args = new[]
        {
          "--input", tempInPath,
          "--output", tempOutDir,
          "--ref", refDir,
          "--emit-json",
          "--no-report"
        };

        var (exitCode, stdout, stderr) = await RunPythonAsync(scriptPath, pythonDir, args, cancellationToken);
        if (exitCode != 0)
          throw new InvalidOperationException($"limpieza.py terminó con código {exitCode}. {stderr}");

        string? pythonSummary = null;
        try
        {
          using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(stdout) ? "{}" : stdout);
          if (doc.RootElement.TryGetProperty("messages", out var msgs) && msgs.ValueKind == JsonValueKind.Array)
          {
            var parts = new List<string>();
            foreach (var m in msgs.EnumerateArray())
              if (m.ValueKind == JsonValueKind.String) parts.Add(m.GetString()!);
            pythonSummary = string.Join(". ", parts);
          }
        }
        catch (Exception ex)
        {
          _logger.LogWarning(ex, "No se pudo parsear JSON de salida de Python. Stdout: {stdout}", stdout);
          pythonSummary = string.Join(" ", (stdout ?? "").Split('\n').Select(l => l.Trim()).Where(l => !string.IsNullOrWhiteSpace(l)).Take(3));
        }

        // El script siempre escribe el CSV limpio; lo tomamos desde tempOutDir
        cleanedFilePath = Path.Combine(tempOutDir, $"validado_{originalFileName}");
        if (!File.Exists(cleanedFilePath))
          throw new InvalidOperationException($"No se generó el archivo limpio esperado: {cleanedFilePath}");

        // Transformar a formato de tu tabla (usa archivo temporal)
        transformedFilePath = await TransformCleanedCsvAsync(cleanedFilePath, cancellationToken);

        // Importar en BD
        await using var transformedStream = File.OpenRead(transformedFilePath);
        var (inserted, skipped) = await _repo.ImportRegistroMedicoCsvAsync(transformedStream, cancellationToken);

        return (inserted, skipped, cleanedFilePath, transformedFilePath, pythonSummary);
      }
      finally
      {
        // Limpieza: borrar artefactos temporales
        TryDeleteFile(tempInPath);
        TryDeleteFile(transformedFilePath);
        TryDeleteFile(cleanedFilePath);
        TryDeleteDirectory(tempOutDir);
      }
    }

    private static void TryDeleteFile(string? path)
    {
      try { if (!string.IsNullOrWhiteSpace(path) && File.Exists(path)) File.Delete(path); }
      catch { /* best effort */ }
    }

    private static void TryDeleteDirectory(string? path)
    {
      try
      {
        if (!string.IsNullOrWhiteSpace(path) && Directory.Exists(path))
          Directory.Delete(path, recursive: true);
      }
      catch { /* best effort */ }
    }

    private async Task<(int exitCode, string stdout, string stderr)> RunPythonAsync(string scriptPath, string workingDirectory, IEnumerable<string> args, CancellationToken ct)
    {
      var candidates = new List<string>();
      if (!string.IsNullOrWhiteSpace(_pythonExePath) && File.Exists(_pythonExePath))
        candidates.Add(_pythonExePath);
      candidates.AddRange(new[] { "python", "py" });

      string scriptFileName = Path.GetFileName(scriptPath);

      foreach (var exe in candidates)
      {
        try
        {
          var psi = new ProcessStartInfo
          {
            FileName = exe,
            WorkingDirectory = workingDirectory,
            CreateNoWindow = true,
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true
          };
          psi.ArgumentList.Add(scriptFileName);
          foreach (var a in args) psi.ArgumentList.Add(a);
          psi.Environment["PYTHONUTF8"] = "1";

          using var proc = Process.Start(psi) ?? throw new InvalidOperationException("No se pudo iniciar Python.");
          var stdOutTask = proc.StandardOutput.ReadToEndAsync();
          var stdErrTask = proc.StandardError.ReadToEndAsync();
          await proc.WaitForExitAsync(ct);
          var stdout = await stdOutTask;
          var stderr = await stdErrTask;
          _logger.LogInformation("Python stdout: {out}", stdout);
          if (!string.IsNullOrWhiteSpace(stderr)) _logger.LogWarning("Python stderr: {err}", stderr);

          return (proc.ExitCode, stdout, stderr);
        }
        catch (Exception ex)
        {
          _logger.LogWarning(ex, "Intento fallido con ejecutable: {exe}", exe);
        }
      }

      throw new InvalidOperationException("No se pudo ejecutar Python. Configura Python:ExePath o añádelo al PATH.");
    }

    private static async Task<string> TransformCleanedCsvAsync(string cleanedFilePath, CancellationToken ct)
    {
      var expectedHeader = new[]
      {
        "fechaIngreso","fechaEgreso","idEstado","idMunicipio","idLoc","edad","idSexo",
        "idDerechoHab","idServicioIngreso","idServicioEgreso","idProcedencia","idMotivoEgreso",
        "idEnfermedad"
      };

      string tempOut = Path.Combine(Path.GetTempPath(), $"transformed_{Guid.NewGuid():N}.csv");

      using var reader = new StreamReader(File.OpenRead(cleanedFilePath), Encoding.UTF8, true);
      using var writer = new StreamWriter(File.Create(tempOut), new UTF8Encoding(false));

      var headerLine = await reader.ReadLineAsync();
      if (headerLine == null) throw new InvalidOperationException("El archivo limpio está vacío.");

      var header = SplitCsvLine(headerLine).Select(h => h.Trim()).ToArray();
      var idx = header.Select((h, i) => (h, i)).ToDictionary(t => t.h, t => t.i, StringComparer.OrdinalIgnoreCase);

      string[] required = {
        "Ingreso","Egreso","IdEntidad","IdMunicipio","ClaveLoc","Edad","IdSexo","IdDerechohab",
        "IdServicioIngreso","IdServicioEgreso","IdProcedencia","IdMotivoEgreso","IdAfecPrincipal"
      };
      foreach (var col in required)
        if (!idx.ContainsKey(col))
          throw new InvalidOperationException($"El archivo limpio no contiene la columna requerida '{col}'.");

      await writer.WriteLineAsync(string.Join(",", expectedHeader));

      string? line;
      while ((line = await reader.ReadLineAsync()) != null)
      {
        ct.ThrowIfCancellationRequested();
        if (string.IsNullOrWhiteSpace(line)) continue;

        var cols = SplitCsvLine(line).ToArray();

        string Get(string col) => idx.TryGetValue(col, out var i) && i < cols.Length ? cols[i] : "";

        var mapped = new[]
        {
          Get("Ingreso"), Get("Egreso"), Get("IdEntidad"), Get("IdMunicipio"), Get("ClaveLoc"),
          Get("Edad"), Get("IdSexo"), Get("IdDerechohab"), Get("IdServicioIngreso"), Get("IdServicioEgreso"),
          Get("IdProcedencia"), Get("IdMotivoEgreso"), Get("IdAfecPrincipal")
        };

        await writer.WriteLineAsync(string.Join(",", mapped.Select(EscapeCsv)));
      }

      await writer.FlushAsync();
      return tempOut;
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
          if (inQuotes && i + 1 < line.Length && line[i + 1] == '\"') { sb.Append('\"'); i++; }
          else { inQuotes = !inQuotes; }
        }
        else if (c == ',' && !inQuotes) { result.Add(sb.ToString()); sb.Clear(); }
        else sb.Append(c);
      }
      result.Add(sb.ToString());
      return result;
    }

    private static string EscapeCsv(string value)
    {
      if (value is null) return "";
      var needsQuotes = value.Contains(',') || value.Contains('"') || value.Contains('\n') || value.Contains('\r');
      var escaped = value.Replace("\"", "\"\"");
      return needsQuotes ? $"\"{escaped}\"" : escaped;
    }
  }
}
