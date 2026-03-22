using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SaludPublicaBackend.Configuration.Jwt;
using SaludPublicaBackend.Configurations.Controllers;
using SaludPublicaBackend.Configurations.CustomHttpResponses;
using SaludPublicaBackend.Configurations.Databases;
using SaludPublicaBackend.Repositories.ActividadUsuarioRepository;
using SaludPublicaBackend.Repositories.EnfermedadRepository;
using SaludPublicaBackend.Repositories.EstadoRepository;
using SaludPublicaBackend.Repositories.Generic;
using SaludPublicaBackend.Repositories.HospitalesRepository;
using SaludPublicaBackend.Repositories.ImportacionRepository;
using SaludPublicaBackend.Repositories.LocalidadRepository;
using SaludPublicaBackend.Repositories.NoticiaRepository;
using SaludPublicaBackend.Repositories.ProcedenciaRepository;
using SaludPublicaBackend.Repositories.RegistroMedicoRepository;
using SaludPublicaBackend.Repositories.RolRepository;
using SaludPublicaBackend.Repositories.ServicioMedicoReposiotry;
using SaludPublicaBackend.Repositories.UserR;
using SaludPublicaBackend.Services.ActividadUsuarioService;
using SaludPublicaBackend.Services.EnfermedadService;
using SaludPublicaBackend.Services.EstadoService;
using SaludPublicaBackend.Services.HospitalesService;
using SaludPublicaBackend.Services.ImportacionService;
using SaludPublicaBackend.Services.LocalidadService;
using SaludPublicaBackend.Services.NoticiaService;
using SaludPublicaBackend.Services.ProcedenciaService;
using SaludPublicaBackend.Services.RegistroMedicoService;
using SaludPublicaBackend.Services.RolService;
using SaludPublicaBackend.Services.ServicioMedicoService;
using SaludPublicaBackend.Services.UserService;
using SaludPublicaBackend.Validators.ActividadUsuarioValidators;
using SaludPublicaBackend.Validators.EnfermedadValidator;
using SaludPublicaBackend.Validators.EstadoValidator;
using SaludPublicaBackend.Validators.HospitalesValidator;
using SaludPublicaBackend.Validators.LocalidadValidator;
using SaludPublicaBackend.Validators.ProcedenciaValidator;
using SaludPublicaBackend.Validators.RegistroMedicoValidators;
using SaludPublicaBackend.Validators.RolValidator;
using SaludPublicaBackend.Validators.ServicioMedicoValidator;
using SaludPublicaBackend.Validators.UserValidators;
//using SaludPublicaBackend.Repositories.LocalidadRepository;
using System.Text;
using SaludPublicaBackend.Repositories.PoblacionEstadoRepository;
using SaludPublicaBackend.Services.PoblacionEstadoService;
using SaludPublicaBackend.Repositories.PoblacionEstadoAnualRepository;
using SaludPublicaBackend.Services.PoblacionEstadoAnualService;
using SaludPublicaBackend.Repositories.RangoEdadRepository;
using SaludPublicaBackend.Services.RangoEdadService;
using SaludPublicaBackend.Validators.RangoEdadValidator;
using SaludPublicaBackend.Repositories.MunicipioRepository;
using SaludPublicaBackend.Services.MunicipioService;
using SaludPublicaBackend.Validators.MunicipioValidator;
using SaludPublicaBackend.Repositories.DerechoHabRepository;
using SaludPublicaBackend.Services.DerechoHabService;
using SaludPublicaBackend.Validators.DerechoHabValidator;
using SaludPublicaBackend.Repositories.MotivosERepository;
using SaludPublicaBackend.Services.MotivosEService;
using SaludPublicaBackend.Validators.MotivosEValidator;
using SaludPublicaBackend.Repositories.LogoPdfRepository;
using SaludPublicaBackend.Services.LogoPdfService;
using SaludPublicaBackend.Repositories.PanelRepository;
using SaludPublicaBackend.Services.PanelService;
using SaludPublicaBackend.Services.DashboardService;

var builder = WebApplication.CreateBuilder(args);

// Configurar Kestrel: el body de subida puede contener imágenes
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = 30 * 1024 * 1024; // 30 MB para subida de logos
});

// Orígenes permitidos
var origenesPermitidos = builder.Configuration.GetValue<string>("OrigenesPermitidos")?.Split(',') ?? Array.Empty<string>();

// Controllers + filtro de validación
builder.Services.AddControllers(options =>
{
    options.Filters.Add(new ValidateModelAttribute());
});

// Swagger con seguridad Bearer
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SaludPublicaBackend API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header
            },
            Array.Empty<string>()
        }
    });
});

// AutoMapper
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
    options.AddPolicy("ProdCors", policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
    options.AddDefaultPolicy(policy => policy.WithOrigins(origenesPermitidos).AllowAnyHeader().AllowAnyMethod());
});

// DbContext: SQL Server
var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? builder.Configuration["ConnectionStrings:DefaultConnection"];

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "No se encontró 'ConnectionStrings:DefaultConnection'. Configúralo en appsettings.*, secretos de usuario o variable de entorno ConnectionStrings__DefaultConnection."
    );
}

builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionString));

// HttpClient
builder.Services.AddHttpClient();
#region importacion

builder.Services.AddScoped<IImportacionRepository, ImportacionRepository>();
builder.Services.AddScoped<IImportacionService, ImportacionService>();

#endregion

#region User
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserValidator, UserValidator>();
#endregion
#region Registro Medico
builder.Services.AddScoped<IRegistroMedicoRepository, RegistroMedicoRepository>();
builder.Services.AddScoped<IRegistroMedicoService, RegistroMedicoService>();
builder.Services.AddScoped<IRegistroMedicoValidator, RegistroMedicoValidator>();
#endregion

#region Actividad Usuario
builder.Services.AddScoped<IActividadUsuarioRepository, ActividadUsuarioRepository>();
builder.Services.AddScoped<IActividadUsuarioService, ActividadUsuarioService>();
builder.Services.AddScoped<IActividadUsuarioValidator, ActividadUsuarioValidator>();
#endregion

#region Enfermedad
builder.Services.AddScoped<IEnfermedadRepository, EnfermedadRepository>();
builder.Services.AddScoped<IEnfermedadService, EnfermedadService>();
builder.Services.AddScoped<IEnfermedadValidator, EnfermedadValidator>();
#endregion
#region Rol
builder.Services.AddScoped<IRolRepository, RolRepository>();
builder.Services.AddScoped<IRolService, RolService>();
builder.Services.AddScoped<IRolValidator, RolValidator>();
#endregion
#region Noticia
builder.Services.AddScoped<INoticiaRepository, NoticiaRepository>();
builder.Services.AddScoped<INoticiaService, NoticiaService>();
#endregion
#region Panel
builder.Services.AddScoped<IPanelRepository, PanelRepository>();
builder.Services.AddScoped<IPanelService, PanelService>();
#endregion
#region RangoEdad
builder.Services.AddScoped<IRangoEdadRepository, RangoEdadRepository>();
builder.Services.AddScoped<IRangoEdadService, RangoEdadService>();
builder.Services.AddScoped<IRangoEdadValidator, RangoEdadValidator>();
#endregion
#region Hospitales
builder.Services.AddScoped<IHospitalesRepository, HospitalesRepository>();
builder.Services.AddScoped<IHospitalesService, HospitalesService>();
builder.Services.AddScoped<IHospitalesValidator, HospitalesValidator>();
#endregion
#region Catálogos Básicos
builder.Services.AddScoped<ILocalidadRepository, LocalidadRepository>();
builder.Services.AddScoped<ILocalidadService, LocalidadService>();
builder.Services.AddScoped<ILocalidadValidator, LocalidadValidator>();

builder.Services.AddScoped<IServicioMedicoRepository, ServicioMedicoRepository>();
builder.Services.AddScoped<IServicioMedicoService, ServicioMedicoService>();
builder.Services.AddScoped<IServicioMedicoValidator, ServicioMedicoValidator>();

builder.Services.AddScoped<IProcedenciaRepository, ProcedenciaRepository>();
builder.Services.AddScoped<IProcedenciaService, ProcedenciaService>();
builder.Services.AddScoped<IProcedenciaValidator, ProcedenciaValidator>();

builder.Services.AddScoped<IDerechoHabRepository, DerechoHabRepository>();
builder.Services.AddScoped<IDerechoHabService, DerechoHabService>();
builder.Services.AddScoped<IDerechoHabValidator, DerechoHabValidator>();

builder.Services.AddScoped<IMotivosERepository, MotivosERepository>();
builder.Services.AddScoped<IMotivosEService, MotivosEService>();
builder.Services.AddScoped<IMotivosEValidator, MotivosEValidator>();
#endregion
#region LogoPdf
builder.Services.AddScoped<ILogoPdfRepository, LogoPdfRepository>();
builder.Services.AddScoped<ILogoPdfService, LogoPdfService>();
#endregion
#region PoblacionEstado
builder.Services.AddScoped<IPoblacionEstadoRepository, PoblacionEstadoRepository>();
builder.Services.AddScoped<IPoblacionEstadoService, PoblacionEstadoService>();
#endregion
#region PoblacionEstadoAnual
builder.Services.AddScoped<IPoblacionEstadoAnualRepository, PoblacionEstadoAnualRepository>();
builder.Services.AddScoped<IPoblacionEstadoAnualService, PoblacionEstadoAnualService>();
#endregion
#region Dashboard
builder.Services.AddScoped<IDashboardService, DashboardService>();
#endregion
#region Estados
builder.Services.AddScoped<IEstadoRepository, EstadoRepository>();
builder.Services.AddScoped<IEstadoService, EstadoService>();
builder.Services.AddScoped<IEstadoValidator, EstadoValidator>();
#endregion
#region Municipios
builder.Services.AddScoped<IMunicipioRepository, MunicipioRepository>();
builder.Services.AddScoped<IMunicipioService, MunicipioService>();
builder.Services.AddScoped<IMunicipioValidator, MunicipioValidator>();
#endregion
//Configuración JWT
var jwtSettingsSection = builder.Configuration.GetSection("Jwt");
builder.Services.Configure<JwtSettings>(jwtSettingsSection);
var jwtSettings = jwtSettingsSection.Get<JwtSettings>()
                  ?? throw new InvalidOperationException("Se debe configurar JwtSettings en appsettings.json");

//Convertir clave JWT a bytes correctamente
byte[] keyBytes;
try
{
    keyBytes = Convert.FromBase64String(jwtSettings.Key);
}
catch (FormatException)
{
    // Si no es Base64, usamos UTF8 (para compatibilidad con cadenas legibles)
    keyBytes = Encoding.UTF8.GetBytes(jwtSettings.Key);
}

// 🔹 Imprimir entorno y longitud de la clave para depuración
/*builder.Logging.AddConsole();
Console.WriteLine("===== Startup Info =====");
Console.WriteLine($"Current Environment: {builder.Environment.EnvironmentName}");
Console.WriteLine($"Connection String length: {connectionString.Length}");
Console.WriteLine($"JWT Key characters length: {jwtSettings.Key?.Length ?? 0}");
Console.WriteLine($"JWT Key bytes length: {keyBytes.Length}");
Console.WriteLine("========================");*/

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes)
    };
});

var app = builder.Build();

// Middleware de excepciones
app.UseMiddleware<ExceptionsMiddleware>();

// Pipeline por entorno
if (app.Environment.IsDevelopment())
{
    app.UseCors("DevCors");
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "SaludPublicaBackend API DEV"));
}
else if (app.Environment.IsStaging())
{
    app.UseCors("DevCors");
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "SaludPublicaBackend API STAGING"));
}
else if (app.Environment.IsProduction())
{
    app.UseCors("ProdCors");
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "SaludPublicaBackend API"));
}

app.UseHttpsRedirection();

// 🔹 Middleware de autenticación y autorización
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ── Diagnóstico de crash: captura excepciones no manejadas que matan el proceso ──
AppDomain.CurrentDomain.UnhandledException += (sender, e) =>
{
    var ex = e.ExceptionObject as Exception;
    Console.Error.WriteLine("╔════════════════════════════════════════════════════════╗");
    Console.Error.WriteLine("║ CRASH: AppDomain.UnhandledException                   ║");
    Console.Error.WriteLine("╚════════════════════════════════════════════════════════╝");
    Console.Error.WriteLine($"IsTerminating: {e.IsTerminating}");
    Console.Error.WriteLine($"Exception: {ex?.ToString() ?? e.ExceptionObject?.ToString()}");
    Console.Error.Flush();
};

TaskScheduler.UnobservedTaskException += (sender, e) =>
{
    Console.Error.WriteLine("╔════════════════════════════════════════════════════════╗");
    Console.Error.WriteLine("║ CRASH: TaskScheduler.UnobservedTaskException           ║");
    Console.Error.WriteLine("╚════════════════════════════════════════════════════════╝");
    Console.Error.WriteLine($"Exception: {e.Exception}");
    Console.Error.Flush();
    e.SetObserved(); // evita que mate el proceso
};

try
{
    app.Run();
}
catch (Exception ex)
{
    Console.Error.WriteLine("╔════════════════════════════════════════════════════════╗");
    Console.Error.WriteLine("║ CRASH: Excepción fatal en app.Run()                    ║");
    Console.Error.WriteLine("╚════════════════════════════════════════════════════════╝");
    Console.Error.WriteLine(ex.ToString());
    Console.Error.Flush();
    throw;
}
