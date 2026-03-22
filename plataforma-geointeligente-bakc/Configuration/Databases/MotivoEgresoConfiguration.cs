using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Configurations.Databases
{
  public class MotivoEgresoConfiguration : IEntityTypeConfiguration<MotivoEgreso>
  {
    public void Configure(EntityTypeBuilder<MotivoEgreso> builder)
    {
      builder.ToTable("MotivoEgreso");

      builder.HasKey(m => m.idMotivoEgreso);

      // 🚩 Como en tu tabla la columna NO es IDENTITY, EF debe enviar el id
      builder.Property(m => m.idMotivoEgreso)
             .ValueGeneratedNever(); // importante: EF NO intentará que SQL lo genere

      builder.Property(m => m.descripcion)
             .HasMaxLength(255)
             .IsRequired(false);
    }
  }
}