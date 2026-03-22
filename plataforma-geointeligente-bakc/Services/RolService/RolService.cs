using AutoMapper;
using SaludPublicaBackend.Dtos.RolDto;
using SaludPublicaBackend.Repositories.RolRepository;
using SaludPublicaBackend.Validators.RolValidator;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SaludPublicaBackend.Services.RolService
{
  public class RolService : IRolService
  {
    private readonly IRolRepository _rolRepository;
    private readonly IRolValidator _rolValidator;
    private readonly IMapper _mapper;

    public RolService(IRolRepository rolRepository, IRolValidator rolValidator, IMapper mapper)
    {
      _rolRepository = rolRepository;
      _rolValidator = rolValidator;
      _mapper = mapper;
    }

    public async Task<IEnumerable<GetRolDto>> GetRoles()
    {
      var roles = await _rolRepository.GetAllAsync<GetRolDto>();
      _rolValidator.IsRolListValid(roles);
      return roles;
    }
  }
}
