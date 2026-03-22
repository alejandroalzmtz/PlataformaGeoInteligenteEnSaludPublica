using Microsoft.EntityFrameworkCore;
using SaludPublicaBackend.Models;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace SaludPublicaBackend.Configurations.Databases;

public class AppDbContext : DbContext
{
  public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

  public DbSet<ActividadUsuario> ActividadesUsuarios { get; set; }
  public DbSet<DerechoHabitacion> DerechosHabitaciones { get; set; }
  public DbSet<Enfermedad> Enfermedades { get; set; }
  public DbSet<Estado> Estados { get; set; }
  public DbSet<Localidad> Localidades { get; set; }
  public DbSet<LogoPdf> LogosPdf { get; set; }
  public DbSet<MotivoEgreso> MotivoEgresos { get; set; }
  public DbSet<Municipio> Municipios { get; set; }
  public DbSet<Panel> Paneles { get; set; }
  public DbSet<Procedencia> Procedencias { get; set; }
  public DbSet<RegistroMedico> RegistroMedicos { get; set; }
  public DbSet<Rol> Roles { get; set; }
  public DbSet<ServicioMedico> ServicioMedicos { get; set; }
  public DbSet<Sexo> Sexos { get; set; }
  public DbSet<Usuario> Usuarios { get; set; }
  public DbSet<Noticia> Noticias { get; set; }
  public DbSet<Hospitales> Hospitales { get; set; }
  public DbSet<PoblacionEstado> PoblacionEstados { get; set; }
  public DbSet<PoblacionEstadoAnual> PoblacionEstadosAnuales { get; set; }
  public DbSet<RangoEdad> RangoEdad { get; set; }

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    modelBuilder.HasDefaultSchema("dbo");

    // Configurar relación RegistroMedico -> Hospitales
    modelBuilder.Entity<RegistroMedico>()
      .HasOne(r => r.Hospital)
      .WithMany()
      .HasForeignKey(r => r.CLUES)
      .HasPrincipalKey(h => h.CLUES)
      .IsRequired();

    modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

    // Composite key: PoblacionEstado (idEstado, Anio)
    modelBuilder.Entity<PoblacionEstado>()
      .HasKey(p => new { p.idEstado, p.Anio });

    // Composite key: PoblacionEstado_Anual (idEstado, Anio)
    modelBuilder.Entity<PoblacionEstadoAnual>()
      .HasKey(p => new { p.idEstado, p.Anio });
    modelBuilder.Entity<PoblacionEstadoAnual>()
      .Property(p => p.EsInterpolado)
      .HasDefaultValue(false);

    base.OnModelCreating(modelBuilder);
  }
}