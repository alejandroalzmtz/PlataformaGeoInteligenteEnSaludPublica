using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SaludPublicaBackend.Configurations.CustomHttpResponses;
using SaludPublicaBackend.Configuration.Jwt;
using SaludPublicaBackend.Dtos.User;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.UserR;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace SaludPublicaBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public UserController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }
        
        [HttpGet("GetUsers")]
        //[Authorize]  // Requiere JWT válido
        [ProducesResponseType(typeof(IEnumerable<Usuario>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<Usuario>>> GetUsers()
        {
            var users = await _userRepository.GetAllAsync();
            return Ok(users);
        }

        [HttpPost("RegisterUser")]
        [ProducesResponseType(typeof(Usuario), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> RegisterUser([FromBody] RegisterUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ErrorMessage { Message = "Datos inválidos." });

            // if (await _userRepository.ExistsByNombreUsuarioAsync(dto.nombreUsuario!))
            //   return BadRequest(new ErrorMessage { Message = "El nombre de usuario ya existe." });
            if (await _userRepository.ExistsByNombreUsuarioAsync(dto.nombreUsuario!))
            {
                return Conflict(new ErrorMessage
                {
                    Message = "El nombre de usuario ya existe."
                });
            }


            var usuario = new Usuario
            {
                nombreUsuario = dto.nombreUsuario,
                contrasena = BCrypt.Net.BCrypt.HashPassword(dto.contrasena), // 🔒 Contraseña hasheada
                fechaRegistro = DateOnly.FromDateTime(DateTime.Now),
                idRol = dto.idRol,
                 activo = true
            };

            var usuarioCreado = await _userRepository.AddAsync(usuario);
            return CreatedAtAction(nameof(GetUsers), new { id = usuarioCreado.idUsuario }, usuarioCreado);
        }

        [HttpPost("Login")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Login([FromBody] LoginUserDto dto, [FromServices] IOptions<JwtSettings> jwtOptions)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ErrorMessage { Message = "Datos inválidos." });

            var usuario = await _userRepository.GetByNombreUsuarioAsync(dto.nombreUsuario);

            if (usuario == null)
                return Unauthorized(new ErrorMessage { Message = "Usuario o contraseña incorrectos." });

            // Doble validación temporal (permite contraseñas antiguas sin hash)
            bool isHashed = usuario.contrasena.StartsWith("$2");
            bool isValid = isHashed
                ? BCrypt.Net.BCrypt.Verify(dto.contrasena, usuario.contrasena)
                : usuario.contrasena == dto.contrasena;

            if (!isValid)
                return Unauthorized(new ErrorMessage { Message = "Usuario o contraseña incorrectos." });
            if (!usuario.activo)
                return Unauthorized(new ErrorMessage { Message = "El usuario está deshabilitado." });


            // Claims para el token
            var claims = new[]
            {
        new Claim(ClaimTypes.NameIdentifier, usuario.idUsuario.ToString()),
        new Claim(ClaimTypes.Name, usuario.nombreUsuario ?? "Desconocido"),
        new Claim(ClaimTypes.Role, usuario.idRol.ToString())
      };

            // Usar clave de configuración
            var jwtSettings = jwtOptions.Value;

            byte[] keyBytes;
            try
            {
                keyBytes = Convert.FromBase64String(jwtSettings.Key); // Si está en Base64
            }
            catch
            {
                keyBytes = Encoding.UTF8.GetBytes(jwtSettings.Key); // Si es texto plano
            }

            var key = new SymmetricSecurityKey(keyBytes);
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtSettings.Issuer,
                audience: jwtSettings.Audience,
                claims: claims,
                expires: DateTime.Now.AddHours(jwtSettings.ExpireHours),
                signingCredentials: creds
            );

            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                idUsuario = usuario.idUsuario,
                nombreUsuario = usuario.nombreUsuario,
                idRol = usuario.idRol
            });
        }

        [HttpPut("UpdateUser/{id}")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] RegisterUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ErrorMessage { Message = "Datos inválidos." });

            var user = await _userRepository.GetAsync(id);
            if (user == null)
                return NotFound(new ErrorMessage { Message = "Usuario no encontrado." });

            user.nombreUsuario = dto.nombreUsuario;

            //Si la contraseña nueva viene sin hash, la hasheamos
            user.contrasena = BCrypt.Net.BCrypt.HashPassword(dto.contrasena);

            user.idRol = dto.idRol;

            await _userRepository.UpdateAsync(user);
            return Ok(user);
        }

        [HttpDelete("DeleteUser/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _userRepository.GetAsync(id);
            if (user == null)
                return NotFound(new ErrorMessage { Message = "Usuario no encontrado." });

            await _userRepository.DeleteAsync(id);
            return NoContent();
        }

        [HttpPost("ValidatePassword")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ValidatePassword([FromBody] ValidatePasswordDto dto)
        {
            try
            {
                var usuario = await _userRepository.GetAsync(dto.idUsuario);

                if (usuario == null)
                    return Unauthorized(new ErrorMessage { Message = "Usuario no encontrado" });

                bool isHashed = usuario.contrasena.StartsWith("$2");
                bool isValid = isHashed
                    ? BCrypt.Net.BCrypt.Verify(dto.password, usuario.contrasena)
                    : usuario.contrasena == dto.password;

                if (!isValid)
                    return Unauthorized(new ErrorMessage { Message = "Contraseña incorrecta" });

                return Ok(true);
            }
            catch (Exception ex)
            {
                // 👇 esto te ayuda a ver el error real en consola
                Console.WriteLine(ex);

                return StatusCode(500, new ErrorMessage
                {
                    Message = "Error interno al validar contraseña"
                });
            }
        }


        [HttpPut("DeactivateUser/{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ErrorMessage), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeactivateUser(int id)
        {
            var user = await _userRepository.GetAsync(id);
            if (user == null)
                return NotFound(new ErrorMessage { Message = "Usuario no encontrado." });

            user.activo = false;
            await _userRepository.UpdateAsync(user);

            return NoContent();
        }






    }
}
