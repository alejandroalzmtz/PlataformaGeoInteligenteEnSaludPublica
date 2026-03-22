using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Configurations.Databases
{
  public class ProcedenciaConfiguration : IEntityTypeConfiguration<Procedencia>
  {
    public void Configure(EntityTypeBuilder<Procedencia> builder)
    {
      builder.ToTable("Procedencia");

      builder.HasKey(p => p.idProcedencia);

      // 🔹 Opción B: la columna NO es IDENTITY en SQL Server
      // Descomenta esto SOLO si en la BD tienes:
      //   idProcedencia INT NOT NULL
      builder.Property(p => p.idProcedencia)
             .ValueGeneratedNever();  // La app debe asignar el id

      builder.Property(p => p.descripcion)
             .HasMaxLength(255);
    }
  }
}