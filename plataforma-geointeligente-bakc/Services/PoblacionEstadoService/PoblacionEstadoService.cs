using AutoMapper;
using SaludPublicaBackend.Dtos.PoblacionEstadoDto;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.PoblacionEstadoRepository;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SaludPublicaBackend.Services.PoblacionEstadoService
{
    public class PoblacionEstadoService : IPoblacionEstadoService
    {
        private readonly IPoblacionEstadoRepository _repository;
        private readonly IMapper _mapper;

        public PoblacionEstadoService(IPoblacionEstadoRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<GetPoblacionEstadoDto>> GetAllAsync()
        {
            var poblaciones = await _repository.GetAllAsync();
            return _mapper.Map<IEnumerable<GetPoblacionEstadoDto>>(poblaciones);
        }

        public async Task<GetPoblacionEstadoDto?> GetByKeyAsync(int idEstado, int anio)
        {
            var poblacion = await _repository.GetByKeyAsync(idEstado, anio);
            return poblacion == null ? null : _mapper.Map<GetPoblacionEstadoDto>(poblacion);
        }

        public async Task<IEnumerable<GetPoblacionEstadoDto>> GetByEstadoAsync(int idEstado)
        {
            var poblaciones = await _repository.GetByEstadoAsync(idEstado);
            return _mapper.Map<IEnumerable<GetPoblacionEstadoDto>>(poblaciones);
        }

        public async Task<GetPoblacionEstadoDto> CreateAsync(CreatePoblacionEstadoDto dto)
        {
            var poblacion = _mapper.Map<PoblacionEstado>(dto);
            var createdPoblacion = await _repository.AddAsync(poblacion);
            return _mapper.Map<GetPoblacionEstadoDto>(createdPoblacion);
        }

        public async Task<GetPoblacionEstadoDto> UpdateAsync(UpdatePoblacionEstadoDto dto)
        {
            var poblacion = await _repository.GetByKeyAsync(dto.idEstado, dto.Anio);
            if (poblacion == null) throw new KeyNotFoundException("Población no encontrada.");

            _mapper.Map(dto, poblacion);
            var updatedPoblacion = await _repository.UpdateAsync(poblacion);
            return _mapper.Map<GetPoblacionEstadoDto>(updatedPoblacion);
        }

        public async Task<bool> DeleteAsync(int idEstado, int anio)
        {
            return await _repository.DeleteAsync(idEstado, anio);
        }
    }
}