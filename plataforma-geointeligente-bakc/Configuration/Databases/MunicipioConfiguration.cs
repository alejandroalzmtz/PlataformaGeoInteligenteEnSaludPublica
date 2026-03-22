using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Configurations.Databases
{
  public class MunicipioConfiguration : IEntityTypeConfiguration<Municipio>
  {
    public void Configure(EntityTypeBuilder<Municipio> builder)
    {
      builder.ToTable("Municipio");
      builder.HasKey(m => m.idMunicipio);
      builder.Property(m => m.idMunicipio).ValueGeneratedOnAdd();

      builder.HasOne<Estado>()
             .WithMany()
             .HasForeignKey(m => m.idEstado)
             .OnDelete(DeleteBehavior.Restrict);

      // Alternate Key para soportar FK de Localidad.idMpo
      builder.HasAlternateKey(m => m.idMpo);
    }
  }
}