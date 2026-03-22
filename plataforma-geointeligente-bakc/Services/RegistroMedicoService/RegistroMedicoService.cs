using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using SaludPublicaBackend.Configurations.CustomHttpResponses;
using SaludPublicaBackend.Dtos.RegistroMedicoDto;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Repositories.RegistroMedicoRepository;
using SaludPublicaBackend.Validators.RegistroMedicoValidators;

namespace SaludPublicaBackend.Services.RegistroMedicoService
{
  public class RegistroMedicoService : IRegistroMedicoService
  {
    private readonly IRegistroMedicoRepository _registroRepository;
    private readonly IRegistroMedicoValidator _registroValidator;
    private readonly IMapper _mapper;

    public RegistroMedicoService(
      IRegistroMedicoRepository registroRepository,
      IRegistroMedicoValidator registroValidator,
      IMapper mapper)
    {
      _registroRepository = registroRepository;
      _registroValidator  = registroValidator;
      _mapper             = mapper;
    }

    // --------- CRUD base ---------

    public async Task<IEnumerable<GetRegistroMedicoDto>> GetRegistros()
    {
  var registros = await _registroRepository.GetAllAsync<GetRegistroMedicoDto>();
  // Vista principal: solo habilitados
  var habilitados = registros.Where(r => r.Habilitado).ToList();
  _registroValidator.IsRegistroListValid(habilitados);
  return habilitados;
    }

    public async Task<GetRegistroMedicoDto> RegisterRegistro(RegisterRegistroMedicoDto dto)
    {
      var entity = _mapper.Map<RegistroMedico>(dto);

      var dias = (entity.fechaEgreso - entity.fechaIngreso).Days;
      if (dias >= 0) entity.diasEstancia = dias;

      var creado = await _registroRepository.AddAsync(entity);
      return _mapper.Map<GetRegistroMedicoDto>(creado);
    }

    public async Task<GetRegistroMedicoDto> UpdateRegistro(int id, RegisterRegistroMedicoDto dto)
    {
      var entity = await _registroRepository.GetAsync(id)
        ?? throw new NotFoundException("RegistroMedico", id);

      _mapper.Map(dto, entity);

      var dias = (entity.fechaEgreso - entity.fechaIngreso).Days;
      entity.diasEstancia = dias >= 0 ? dias : 0;

      await _registroRepository.UpdateAsync(entity);
      return _mapper.Map<GetRegistroMedicoDto>(entity);
    }

    public async Task DeleteRegistro(int id)
    {
      var entity = await _registroRepository.GetAsync(id)
        ?? throw new NotFoundException("RegistroMedico", id);

      // Borrado lógico
      entity.Habilitado = false;
      entity.FechaEliminacion = DateTime.UtcNow;

      await _registroRepository.UpdateAsync(entity);
    }
    public async Task RevertirEliminacion(int id)
    {
      var entity = await _registroRepository.GetAsync(id)
        ?? throw new NotFoundException("RegistroMedico", id);

      if (!entity.Habilitado)
      {
        entity.Habilitado = true;
        entity.FechaEliminacion = null;
        await _registroRepository.UpdateAsync(entity);
      }
      else
      {
        throw new BadRequestException("El registro ya está habilitado.");
      }
    }

  // --------- develop: utilidades de listado ---------
    public async Task<IEnumerable<GetRegistroMedicoDto>> GetRegistrosDeshabilitados()
    {
      var registros = await _registroRepository.GetDeshabilitadosAsync();
      return registros.Select(r => _mapper.Map<GetRegistroMedicoDto>(r)).ToList();
    }

    public async Task<IEnumerable<GetRegistroMedicoDto>> GetRegistrosByRange(int startId, int endId)
    {
      var registros = await _registroRepository.GetByIdRangeAsync(startId, endId, soloHabilitados: true);
      return registros.Select(r => _mapper.Map<GetRegistroMedicoDto>(r)).ToList();
    }

  // --------- Año / IDs (con filtro opcional por diagnóstico, p.ej. C50) ---------

    public async Task<GetRegistroMedicoYear> GetRegistrosYearAsync(
      int year, int? startId, int? endId, string? enfermedadCode = null)
    {
      if (year <= 0)
        throw new BadRequestException("El parámetro 'year' debe ser un año válido.");

      if ((startId.HasValue && !endId.HasValue) || (!startId.HasValue && endId.HasValue))
        throw new BadRequestException("Para filtrar por rango de IDs se requieren ambos parámetros: 'startId' y 'endId'.");

      if (startId.HasValue && endId.HasValue && startId > endId)
        throw new BadRequestException("El parámetro 'startId' no puede ser mayor que 'endId'.");

      var ids = await _registroRepository.GetIdsByYearAsync(
        year, startId, endId, by: "egreso", enfermedadCode: enfermedadCode);

      return new GetRegistroMedicoYear
      {
        year    = year,
        startId = startId,
        endId   = endId,
        ids     = ids,
        total   = ids.Count
      };
    }

    // Subconjuntos por lista de IDs (para casos no contiguos como filtro C50)
    public async Task<IEnumerable<GetRegistroMedicoDto>> GetByIdsAsync(IList<int> ids)
    {
      if (ids == null || ids.Count == 0)
        return Enumerable.Empty<GetRegistroMedicoDto>();

      var rows = await _registroRepository.GetByIdsAsync(ids);
      return rows;
    }

    // --------- Resumen por años ---------
    public async Task<IEnumerable<GetRegistroMedicoYear>> GetRegistrosYearsAsync(bool includeIds = false, string by = "egreso")
    {
      if (!includeIds)
      {
        var summary = await _registroRepository.GetYearsSummaryAsync(by: by);
        return summary.Select(s => new GetRegistroMedicoYear
        {
          year    = s.Year,
          startId = s.StartId,
          endId   = s.EndId,
          ids     = new List<int>(),
          total   = s.Count
        }).ToList();
      }

      var years  = await _registroRepository.GetDistinctYearsAsync(by);
      var result = new List<GetRegistroMedicoYear>(capacity: years.Count);

      foreach (var y in years)
      {
        var ids = await _registroRepository.GetIdsByYearAsync(y, null, null, by);
        if (ids.Count == 0) continue;

        result.Add(new GetRegistroMedicoYear
        {
          year    = y,
          startId = ids.FirstOrDefault(),
          endId   = ids.LastOrDefault(),
          ids     = ids,
          total   = ids.Count
        });
      }

      return result;
    }

    // NUEVO: Paginación
    public async Task<PagedRegistroDto> GetPagedAsync(int page, int pageSize)
    {
      if (page <= 0) throw new BadRequestException("El número de página debe ser mayor que 0.");
      if (pageSize <= 0) throw new BadRequestException("El tamaño de página debe ser mayor que 0.");

      var (items, total) = await _registroRepository.GetPagedAsync(page, pageSize);
      // Aseguramos solo habilitados (por si el repositorio cambia en el futuro)
      var habilitados = items.Where(r => r.Habilitado).ToList();

      var registrosDto = habilitados.Select(r => _mapper.Map<GetRegistroMedicoDto>(r)).ToList();
      var totalPages = (int)Math.Ceiling(total / (double)pageSize);

      return new PagedRegistroDto
      {
        page = page,
        pageSize = pageSize,
        totalPages = totalPages,
        totalRecords = total,
        hasPrevious = page > 1,
        hasNext = page < totalPages,
        registros = registrosDto
      };
    }

    public async Task<PagedRegistroDto> SearchAsync(string? query, int page, int pageSize)
    {
      if (page <= 0) throw new BadRequestException("page debe ser > 0");
      if (pageSize <= 0) throw new BadRequestException("pageSize debe ser > 0");

      var (items, total, filtered) = await _registroRepository.SearchPagedAsync(query, page, pageSize);

      var dtos = items.Select(r => _mapper.Map<GetRegistroMedicoDto>(r)).ToList();
      var totalPages = (int)Math.Ceiling(filtered / (double)pageSize);

      return new PagedRegistroDto
      {
        page = page,
        pageSize = pageSize,
        totalRecords = total,      // todos los habilitados sin filtro
        filteredRecords = filtered, // total tras aplicar búsqueda
        totalPages = totalPages,
        hasPrevious = page > 1,
        hasNext = page < totalPages,
        query = string.IsNullOrWhiteSpace(query) ? null : query,
        registros = dtos
      };
    }

        public async Task<(int Updated, List<int> NotFound)> RevertirEliminacionMasivo(IList<int> ids)
        {
            if (ids == null || ids.Count == 0)
                throw new BadRequestException("Debe enviar al menos un id.");

            var validIds = ids.Where(x => x > 0).Distinct().ToList();
            if (validIds.Count > 500)
                throw new BadRequestException("Máximo 500 ids por solicitud.");

            var updated = 0;
            var notFound = new List<int>();

            foreach (var id in validIds)
            {
                try
                {
                    await RevertirEliminacion(id);
                    updated++;
                }
                catch (NotFoundException)
                {
                    notFound.Add(id);
                }
                catch (BadRequestException)
                {
                    // El registro ya está habilitado, se omite
                }
            }

            return (updated, notFound);
        }

        public async Task<(int Deleted, List<int> NotFound)> DeleteRegistroMasivo(IList<int> ids)
        {
            if (ids == null || ids.Count == 0)
                throw new BadRequestException("Debe enviar al menos un id.");

            var validIds = ids.Where(x => x > 0).Distinct().ToList();
            if (validIds.Count > 500)
                throw new BadRequestException("Máximo 500 ids por solicitud.");

            var deleted = 0;
            var notFound = new List<int>();

            foreach (var id in validIds)
            {
                try
                {
                    await DeleteRegistro(id);
                    deleted++;
                }
                catch (NotFoundException)
                {
                    notFound.Add(id);
                }
            }

            return (deleted, notFound);
        }

        public async Task<int> CleanExpiredAsync()
        {
            var deshabilitados = await _registroRepository.GetDeshabilitadosAsync();
            var expirados = deshabilitados
                .Where(r => r.FechaEliminacion != null &&
                            r.FechaEliminacion <= DateTime.UtcNow.AddMonths(-3))
                .ToList();

            foreach (var reg in expirados)
                await _registroRepository.DeleteAsync(reg.idRegistro);

            return expirados.Count;
        }

    }
}
