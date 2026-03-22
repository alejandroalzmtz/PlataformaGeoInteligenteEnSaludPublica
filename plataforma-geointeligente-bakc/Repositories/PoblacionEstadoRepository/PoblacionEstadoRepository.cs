using Microsoft.EntityFrameworkCore;
using SaludPublicaBackend.Configurations.Databases;
using SaludPublicaBackend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SaludPublicaBackend.Repositories.PoblacionEstadoRepository
{
    public class PoblacionEstadoRepository : IPoblacionEstadoRepository
    {
        private readonly AppDbContext _context;

        public PoblacionEstadoRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PoblacionEstado>> GetAllAsync()
        {
            return await _context.PoblacionEstados.ToListAsync();
        }

        public async Task<PoblacionEstado?> GetByKeyAsync(int idEstado, int anio)
        {
            return await _context.PoblacionEstados
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.idEstado == idEstado && p.Anio == anio);
        }

        public async Task<IEnumerable<PoblacionEstado>> GetByEstadoAsync(int idEstado)
        {
            return await _context.PoblacionEstados
                .AsNoTracking()
                .Where(p => p.idEstado == idEstado)
                .OrderBy(p => p.Anio)
                .ToListAsync();
        }

        public async Task<PoblacionEstado> AddAsync(PoblacionEstado poblacionEstado)
        {
            _context.PoblacionEstados.Add(poblacionEstado);
            await _context.SaveChangesAsync();
            return poblacionEstado;
        }

        public async Task<PoblacionEstado> UpdateAsync(PoblacionEstado poblacionEstado)
        {
            _context.PoblacionEstados.Update(poblacionEstado);
            await _context.SaveChangesAsync();
            return poblacionEstado;
        }

        public async Task<bool> DeleteAsync(int idEstado, int anio)
        {
            var poblacionEstado = await _context.PoblacionEstados
                .FirstOrDefaultAsync(p => p.idEstado == idEstado && p.Anio == anio);
            if (poblacionEstado == null) return false;

            _context.PoblacionEstados.Remove(poblacionEstado);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}