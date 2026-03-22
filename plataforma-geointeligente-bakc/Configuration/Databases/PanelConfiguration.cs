using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Configurations.Databases
{
  public class PanelConfiguration : IEntityTypeConfiguration<Panel>
  {
    public void Configure(EntityTypeBuilder<Panel> builder)
    {
      builder.ToTable("Panel", t => t.HasTrigger("Panel_Triggers"));
      builder.HasKey(e => e.idPanel);
      builder.Property(e => e.idPanel).ValueGeneratedOnAdd();

      builder.Property(e => e.nombrePanel)
             .IsRequired()
             .HasMaxLength(200);

      builder.Property(e => e.configuracion);

      builder.Property(e => e.usuarioCreador)
             .IsRequired();

      builder.Property(e => e.activo)
             .IsRequired()
             .HasDefaultValue(true);

      builder.Property(e => e.fechaCreacion)
             .IsRequired()
             .HasDefaultValueSql("SYSDATETIME()");

      builder.Property(e => e.fechaActualizacion);

      // FK → Usuario
      builder.HasOne(e => e.Usuario)
             .WithMany()
             .HasForeignKey(e => e.usuarioCreador)
             .OnDelete(DeleteBehavior.Restrict);
    }
  }
}
