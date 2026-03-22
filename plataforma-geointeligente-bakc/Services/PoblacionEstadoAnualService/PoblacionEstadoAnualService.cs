using AutoMapper;
using SaludPublicaBackend.Dtos.PoblacionEstadoAnualDto;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.PoblacionEstadoAnualRepository;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SaludPublicaBackend.Services.PoblacionEstadoAnualService
{
    public class PoblacionEstadoAnualService : IPoblacionEstadoAnualService
    {
        private readonly IPoblacionEstadoAnualRepository _repository;
        private readonly IMapper _mapper;

        public PoblacionEstadoAnualService(IPoblacionEstadoAnualRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<GetPoblacionEstadoAnualDto>> GetAllAsync()
        {
            var items = await _repository.GetAllAsync();
            return _mapper.Map<IEnumerable<GetPoblacionEstadoAnualDto>>(items);
        }

        public async Task<GetPoblacionEstadoAnualDto?> GetByKeyAsync(int idEstado, int anio)
        {
            var item = await _repository.GetByKeyAsync(idEstado, anio);
            return item == null ? null : _mapper.Map<GetPoblacionEstadoAnualDto>(item);
        }

        public async Task<IEnumerable<GetPoblacionEstadoAnualDto>> GetByEstadoAsync(int idEstado)
        {
            var items = await _repository.GetByEstadoAsync(idEstado);
            return _mapper.Map<IEnumerable<GetPoblacionEstadoAnualDto>>(items);
        }

        public async Task<GetPoblacionEstadoAnualDto> CreateAsync(CreatePoblacionEstadoAnualDto dto)
        {
            var entity = _mapper.Map<PoblacionEstadoAnual>(dto);
            var created = await _repository.AddAsync(entity);
            return _mapper.Map<GetPoblacionEstadoAnualDto>(created);
        }

        public async Task<GetPoblacionEstadoAnualDto> UpdateAsync(UpdatePoblacionEstadoAnualDto dto)
        {
            var entity = await _repository.GetByKeyAsync(dto.idEstado, dto.Anio);
            if (entity == null) throw new KeyNotFoundException("Población anual no encontrada.");

            _mapper.Map(dto, entity);
            var updated = await _repository.UpdateAsync(entity);
            return _mapper.Map<GetPoblacionEstadoAnualDto>(updated);
        }

        public async Task<bool> DeleteAsync(int idEstado, int anio)
        {
            return await _repository.DeleteAsync(idEstado, anio);
        }
    }
}
