using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Configurations.Databases
{
  public class ActividadUsuarioConfiguration : IEntityTypeConfiguration<ActividadUsuario>
  {
    public void Configure(EntityTypeBuilder<ActividadUsuario> builder)
    {
      builder.ToTable("ActividadUsuario");

      // PK real
      builder.HasKey(a => a.idActividad);

      // Eliminar renombre previo (antes: idActividadUsuario)
      builder.Property(a => a.idActividad)
             .ValueGeneratedOnAdd();

      builder.Property(a => a.idUsuario)
             .IsRequired();

      // Si NO existen en la BD estas columnas, ignóralas:
      builder.Ignore(a => a.fechaInicioSesion);
      builder.Ignore(a => a.fechaFinSesion);

      builder.Property(a => a.fechaActividad).HasColumnType("date");
      builder.Property(a => a.hora).HasColumnType("time");

      builder.Property(a => a.descripcionAccion)
             .HasMaxLength(500);

      builder.HasOne<Usuario>()
             .WithMany()
             .HasForeignKey(a => a.idUsuario)
             .OnDelete(DeleteBehavior.Restrict);
    }
  }
}