using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Configurations.Databases
{
  public class SexoConfiguration : IEntityTypeConfiguration<Sexo>
  {
    public void Configure(EntityTypeBuilder<Sexo> builder)
    {
      builder.ToTable("Sexo");
      builder.HasKey(s => s.idSexo);
      builder.Property(s => s.idSexo).ValueGeneratedOnAdd();
    }
  }
}