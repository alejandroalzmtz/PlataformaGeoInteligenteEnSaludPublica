using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Configurations.Databases
{
  public class ServicioMedicoConfiguration : IEntityTypeConfiguration<ServicioMedico>
  {
    public void Configure(EntityTypeBuilder<ServicioMedico> builder)
    {
      builder.ToTable("ServicioMedico");

      builder.HasKey(s => s.idServicio);

      // 🔹 Igual que Procedencia: la columna NO es IDENTITY, la app debe asignar el id
      builder.Property(s => s.idServicio)
             .ValueGeneratedNever();

      builder.Property(s => s.nombreServicio)
             .HasMaxLength(255);

      builder.Property(s => s.descripcion)
             .HasMaxLength(255);
    }
  }
}