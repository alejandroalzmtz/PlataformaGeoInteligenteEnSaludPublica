using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Configuration.Databases
{
  public class RangoEdadConfiguration : IEntityTypeConfiguration<RangoEdad>
  {
    public void Configure(EntityTypeBuilder<RangoEdad> builder)
    {
      builder.ToTable("RangoEdad");
      builder.HasKey(r => r.Id);
      builder.Property(r => r.Id).ValueGeneratedOnAdd();
    }
  }
}
