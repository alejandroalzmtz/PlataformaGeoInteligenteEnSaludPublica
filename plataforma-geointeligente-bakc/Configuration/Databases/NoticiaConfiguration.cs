using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Configurations.Databases
{
  public class NoticiaConfiguration : IEntityTypeConfiguration<Noticia>
  {
    public void Configure(EntityTypeBuilder<Noticia> builder)
    {
      builder.ToTable("Noticia");
      builder.HasKey(e => e.idNoticia);
      builder.Property(e => e.idNoticia).ValueGeneratedOnAdd();

      builder.Property(e => e.titulo)
             .IsRequired()
             .HasMaxLength(255);

      builder.Property(e => e.contenido)
             .IsRequired();

      builder.Property(e => e.imagenPrincipal)
             .HasMaxLength(500);
    }
  }
}
