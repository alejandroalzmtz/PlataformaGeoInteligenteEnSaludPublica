using Microsoft.EntityFrameworkCore;
using SaludPublicaBackend.Configurations.Databases;
using SaludPublicaBackend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SaludPublicaBackend.Repositories.PoblacionEstadoAnualRepository
{
    public class PoblacionEstadoAnualRepository : IPoblacionEstadoAnualRepository
    {
        private readonly AppDbContext _context;

        public PoblacionEstadoAnualRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PoblacionEstadoAnual>> GetAllAsync()
        {
            return await _context.PoblacionEstadosAnuales.ToListAsync();
        }

        public async Task<PoblacionEstadoAnual?> GetByKeyAsync(int idEstado, int anio)
        {
            return await _context.PoblacionEstadosAnuales
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.idEstado == idEstado && p.Anio == anio);
        }

        public async Task<IEnumerable<PoblacionEstadoAnual>> GetByEstadoAsync(int idEstado)
        {
            return await _context.PoblacionEstadosAnuales
                .AsNoTracking()
                .Where(p => p.idEstado == idEstado)
                .OrderBy(p => p.Anio)
                .ToListAsync();
        }

        public async Task<PoblacionEstadoAnual> AddAsync(PoblacionEstadoAnual entity)
        {
            _context.PoblacionEstadosAnuales.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<PoblacionEstadoAnual> UpdateAsync(PoblacionEstadoAnual entity)
        {
            _context.PoblacionEstadosAnuales.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> DeleteAsync(int idEstado, int anio)
        {
            var entity = await _context.PoblacionEstadosAnuales
                .FirstOrDefaultAsync(p => p.idEstado == idEstado && p.Anio == anio);
            if (entity == null) return false;

            _context.PoblacionEstadosAnuales.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
