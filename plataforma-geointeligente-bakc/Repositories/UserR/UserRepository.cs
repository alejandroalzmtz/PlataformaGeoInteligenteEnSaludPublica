using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SaludPublicaBackend.Configurations.Databases;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.Generic;
using System;
using System.Threading.Tasks;

namespace SaludPublicaBackend.Repositories.UserR
{
    public class UserRepository : GenericRepository<Usuario>, IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context, IMapper mapper) : base(context, mapper)
        {
            _context = context;
        }

        public async Task<bool> ExistsByNombreUsuarioAsync(string nombreUsuario)
        {
            try
            {
                return await _context.Usuarios.AnyAsync(u => u.nombreUsuario == nombreUsuario);
            }
            catch (Exception ex)
            {
                throw new Exception("Ocurrió un error al verificar la existencia del usuario por nombre.", ex);
            }
        }

        // 🔹 Nuevo método para obtener un usuario por su nombre (usado en el login)
        public async Task<Usuario?> GetByNombreUsuarioAsync(string nombreUsuario)
        {
            try
            {
                return await _context.Usuarios
                  .FirstOrDefaultAsync(u => u.nombreUsuario == nombreUsuario);
            }
            catch (Exception ex)
            {
                throw new Exception("Ocurrió un error al obtener el usuario por nombre de usuario.", ex);
            }
        }
    }
}
