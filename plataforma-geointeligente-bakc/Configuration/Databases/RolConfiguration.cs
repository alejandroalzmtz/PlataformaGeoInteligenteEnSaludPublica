using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Configurations.Databases
{
  public class RolConfiguration : IEntityTypeConfiguration<Rol>
  {
    public void Configure(EntityTypeBuilder<Rol> builder)
    {
      builder.ToTable("Rol");
      builder.HasKey(r => r.idRol);
      builder.Property(r => r.idRol).ValueGeneratedOnAdd();
    }
  }
}