using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Configurations.Databases
{
  public class EnfermedadConfiguration : IEntityTypeConfiguration<Enfermedad>
  {
    public void Configure(EntityTypeBuilder<Enfermedad> builder)
    {
      builder.ToTable("Enfermedad");
      // PK real: codigoICD
      builder.HasKey(e => e.codigoICD);
      builder.Property(e => e.codigoICD).IsRequired();
    }
  }
}