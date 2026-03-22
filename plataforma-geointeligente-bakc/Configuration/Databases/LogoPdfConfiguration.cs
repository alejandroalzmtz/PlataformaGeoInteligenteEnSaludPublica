using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Configurations.Databases
{
  public class LogoPdfConfiguration : IEntityTypeConfiguration<LogoPdf>
  {
    public void Configure(EntityTypeBuilder<LogoPdf> builder)
    {
      builder.ToTable("LogoPdf");
      builder.HasKey(e => e.IdLogo);
      builder.Property(e => e.IdLogo).ValueGeneratedOnAdd();

      builder.Property(e => e.Nombre)
             .IsRequired()
             .HasMaxLength(255);

      builder.Property(e => e.ImagenData)
             .IsRequired()
             .HasColumnType("varbinary(max)");

      builder.Property(e => e.Formato)
             .IsRequired()
             .HasMaxLength(10);

      builder.Property(e => e.Tamanio)
             .IsRequired();

      builder.Property(e => e.FechaSubida)
             .HasColumnType("datetime2")
             .IsRequired();

      builder.Property(e => e.EsActivo)
             .IsRequired()
             .HasDefaultValue(false);

      // Índice para búsqueda rápida del logo activo
      builder.HasIndex(e => e.EsActivo);
    }
  }
}
