using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Configurations.Databases
{
  public class LocalidadConfiguration : IEntityTypeConfiguration<Localidad>
  {
    public void Configure(EntityTypeBuilder<Localidad> builder)
    {
      builder.ToTable("Localidad");

      // PK
      builder.HasKey(l => l.idLoc);
      builder.Property(l => l.idLoc)
             .ValueGeneratedOnAdd();

      // Si idLocalidad es un código externo y no único, dejarlo así.
      // Si debe ser único, descomenta:
      // builder.HasIndex(l => l.idLocalidad).HasDatabaseName("UQ_Localidad_idLocalidad").IsUnique();

      // Índices para acelerar LIKE y filtros
      builder.HasIndex(l => l.nombreLocalidad)
             .HasDatabaseName("IX_Localidad_Nombre");

      builder.HasIndex(l => new { l.idMpo, l.idEdo })
             .HasDatabaseName("IX_Localidad_Mpo_Edo");

      // Relaciones
      builder.HasOne<Estado>()
             .WithMany()
             .HasForeignKey(l => l.idEdo)
             .OnDelete(DeleteBehavior.Restrict);

      builder.HasOne<Municipio>()
             .WithMany()
             .HasForeignKey(l => l.idMpo)
             .HasPrincipalKey(m => m.idMpo) // Tipado fuerte en vez de string
             .OnDelete(DeleteBehavior.Restrict);

      // Opcional: normalizar a mayúsculas para búsquedas (SQL Server):
      // builder.Property(l => l.nombreLocalidad)
      //        .HasColumnType("nvarchar(200)")
      //        .UseCollation("SQL_Latin1_General_CP1_CI_AI"); // case-insensitive, accent-insensitive
    }
  }
}