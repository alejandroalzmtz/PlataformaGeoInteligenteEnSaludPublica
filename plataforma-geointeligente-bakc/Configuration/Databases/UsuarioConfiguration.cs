using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Configurations.Databases
{
  public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
  {
    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
      builder.ToTable("Usuario", "dbo");

      builder.HasKey(u => u.idUsuario);

      builder.Property(u => u.idUsuario).ValueGeneratedOnAdd();

      builder.Property(u => u.nombreUsuario)
             .IsRequired()
             .HasMaxLength(100);

      builder.Property(u => u.contrasena)
             .IsRequired()
             .HasMaxLength(150);

      builder.Property(u => u.fechaRegistro)
             .HasColumnType("date")
             .IsRequired()
             .HasDefaultValueSql("CAST(GETDATE() AS date)");

      builder.Property(u => u.idRol).IsRequired();

      builder.HasOne<Rol>()
             .WithMany()
             .HasForeignKey(u => u.idRol)
             .OnDelete(DeleteBehavior.Restrict);
    }
  }
}