using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Configurations.Databases
{
  public class DerechoHabitacionConfiguration : IEntityTypeConfiguration<DerechoHabitacion>
  {
    public void Configure(EntityTypeBuilder<DerechoHabitacion> builder)
    {
      builder
        .ToTable("DerechoHabitacion", "dbo");

      builder.HasKey(d => d.idDerechoHab);

      // IMPORTANTE: el id ya no es generado por la BD
      builder.Property(d => d.idDerechoHab)
             .ValueGeneratedNever();
    }
  }
}