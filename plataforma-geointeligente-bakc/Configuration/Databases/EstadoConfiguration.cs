using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Configurations.Databases
{
  public class EstadoConfiguration : IEntityTypeConfiguration<Estado>
  {
    public void Configure(EntityTypeBuilder<Estado> builder)
    {
      builder.ToTable("Estado");
      builder.HasKey(e => e.idEstado);
      builder.Property(e => e.idEstado)
        .ValueGeneratedOnAdd()
        .HasColumnName("idEstado");
    }
  }
}