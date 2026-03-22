using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaludPublicaBackend.Models;

namespace SaludPublicaBackend.Configurations.Databases
{
  public class RegistroMedicoConfiguration : IEntityTypeConfiguration<RegistroMedico>
  {
    public void Configure(EntityTypeBuilder<RegistroMedico> builder)
    {
      builder.ToTable("RegistroMedico");
      builder.HasKey(r => r.idRegistro);
      builder.Property(r => r.idRegistro).ValueGeneratedOnAdd();

      builder.Property(r => r.fechaIngreso).HasColumnType("datetime");
      builder.Property(r => r.fechaEgreso).HasColumnType("datetime");
      builder.Property(r => r.FechaEliminacion).HasColumnType("datetime");
      builder.Property(r => r.idEnfermedad).HasMaxLength(50).IsRequired();
      builder.Property(r => r.CLUES).HasColumnName("CLUES").HasMaxLength(50);

      builder.HasOne<Estado>().WithMany().HasForeignKey(r => r.idEstado).OnDelete(DeleteBehavior.Restrict);
      builder.HasOne<Municipio>().WithMany().HasForeignKey(r => r.idMunicipio).OnDelete(DeleteBehavior.Restrict);
      builder.HasOne<Sexo>().WithMany().HasForeignKey(r => r.idSexo).OnDelete(DeleteBehavior.Restrict);
      builder.HasOne<DerechoHabitacion>().WithMany().HasForeignKey(r => r.idDerechoHab).OnDelete(DeleteBehavior.Restrict);
      builder.HasOne<ServicioMedico>().WithMany().HasForeignKey(r => r.idServicioIngreso).OnDelete(DeleteBehavior.Restrict);
      builder.HasOne<ServicioMedico>().WithMany().HasForeignKey(r => r.idServicioEgreso).OnDelete(DeleteBehavior.Restrict);
      builder.HasOne<Procedencia>().WithMany().HasForeignKey(r => r.idProcedencia).OnDelete(DeleteBehavior.Restrict);
      builder.HasOne<MotivoEgreso>().WithMany().HasForeignKey(r => r.idMotivoEgreso).OnDelete(DeleteBehavior.Restrict);

      // Enfermedad: PK = codigoICD ya definida en EnfermedadConfiguration => no usar HasPrincipalKey
      builder.HasOne<Enfermedad>()
             .WithMany()
             .HasForeignKey(r => r.idEnfermedad)
             .OnDelete(DeleteBehavior.Restrict);

      // Hospitales: FK configurada en AppDbContext (requiere HasPrincipalKey)\n\n      // Localidad: FK -> idLoc
      builder.HasOne<Localidad>()
             .WithMany()
             .HasForeignKey(r => r.idLoc)
             .OnDelete(DeleteBehavior.Restrict);
    }
  }
}
