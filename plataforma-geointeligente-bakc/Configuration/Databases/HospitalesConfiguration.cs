using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Configurations.Databases
{
  public class HospitalesConfiguration : IEntityTypeConfiguration<Hospitales>
  {
    public void Configure(EntityTypeBuilder<Hospitales> builder)
    {
      builder.ToTable("Hospitales");

      // PK
      builder.HasKey(h => h.CLUES);
      builder.Property(h => h.CLUES)
             .IsRequired()
             .HasMaxLength(50); // Ajusta según longitud real en la tabla

      // Coordenadas (almacenadas como texto en el modelo)
      builder.Property(h => h.Latitud)
             .HasMaxLength(50);
      builder.Property(h => h.Longitud)
             .HasMaxLength(50);

      // Datos de institución
      builder.Property(h => h.NombreInstitucion).HasMaxLength(255);
      builder.Property(h => h.ClaveInstitucion).HasMaxLength(50);
      builder.Property(h => h.NombreLocalidad).HasMaxLength(255);
      builder.Property(h => h.NombreUnidad).HasMaxLength(255);

      // Dirección y contacto
      builder.Property(h => h.Calle).HasMaxLength(255);
      builder.Property(h => h.NumeroExterior).HasMaxLength(50);
      builder.Property(h => h.Colonia).HasMaxLength(255);
      builder.Property(h => h.Lada).HasMaxLength(10);
      builder.Property(h => h.Telefono).HasMaxLength(50);
      builder.Property(h => h.Email).HasMaxLength(255);
      builder.Property(h => h.EstratoUnidad).HasMaxLength(50);

      // Índices sugeridos para búsqueda geográfica / catálogo

      builder.HasOne<Localidad>().WithMany().HasForeignKey(h => h.Localidad).HasPrincipalKey(l => l.idLoc).OnDelete(DeleteBehavior.Restrict);
      builder.HasOne<Estado>().WithMany().HasForeignKey(r => r.Estado).HasPrincipalKey(l => l.idEstado).OnDelete(DeleteBehavior.Restrict);
      builder.HasOne<Municipio>().WithMany().HasForeignKey(r => r.Municipio).HasPrincipalKey(l => l.idMunicipio).OnDelete(DeleteBehavior.Restrict);
    }
  }
}
