using AutoMapper;
using Microsoft.AspNetCore.Identity;
using SaludPublicaBackend.Dtos.User;
using SaludPublicaBackend.Repositories.UserR;
using SaludPublicaBackend.Validators.UserValidators;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SaludPublicaBackend.Services.UserService
{
  public class UserService : IUserService
  {
    private readonly IUserRepository _userRepository;
    private readonly IUserValidator _userValidator;
    private readonly IMapper _mapper;

    public UserService(IUserRepository userRepository, IUserValidator userValidator, IMapper mapper)
    {
      _userRepository = userRepository;
      _userValidator = userValidator;
      _mapper = mapper;
    }

    public async Task<IEnumerable<GetUserDto>> GetUsers()
    {
      var users = await _userRepository.GetAllAsync<GetUserDto>();
      _userValidator.IsUserListValid(users);
      return users;
    }
  }
}