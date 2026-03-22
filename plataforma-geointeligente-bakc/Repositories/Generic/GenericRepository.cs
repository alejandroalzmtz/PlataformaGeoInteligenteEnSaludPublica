using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using SaludPublicaBackend.Configurations.Databases;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SaludPublicaBackend.Repositories.Generic
{
  public class GenericRepository<T> : IGenericRepository<T> where T : class
  {
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public GenericRepository(AppDbContext context, IMapper mapper)
    {
      _context = context;
      _mapper = mapper;
    }

    public async Task<T?> GetAsync(params object[] keyValues)
    {
      if (keyValues is null || keyValues.Length == 0)
        throw new ArgumentException("No se proporcionó clave para buscar la entidad.", nameof(keyValues));

      return await _context.Set<T>().FindAsync(keyValues);
    }

    public async Task<TResult> GetAsync<TResult>(params object[] keyValues)
    {
      var entity = await GetAsync(keyValues);
      if (entity is null)
        throw new KeyNotFoundException($"No se encontró {typeof(T).Name} con la clave especificada.");

      return _mapper.Map<TResult>(entity);
    }

    public async Task<List<T>> GetAllAsync()
    {
      return await _context.Set<T>().ToListAsync();
    }

    public async Task<List<TResult>> GetAllAsync<TResult>()
    {
      return await _context
        .Set<T>()
        .ProjectTo<TResult>(_mapper.ConfigurationProvider)
        .ToListAsync();
    }

    // Intenta filtrar por 'Enabled' y ordenar por 'CreationDate' si existen en el modelo.
    public async Task<List<TResult>> GetAllEnabledAsync<TResult>()
    {
      IQueryable<T> query = _context.Set<T>();

      var hasEnabled = typeof(T).GetProperty("Enabled") != null;
      var hasCreationDate = typeof(T).GetProperty("CreationDate") != null;

      if (hasEnabled)
        query = query.Where(x => EF.Property<bool>(x, "Enabled") == true);

      if (hasCreationDate)
        query = query.OrderBy(x => EF.Property<object>(x, "CreationDate"));

      var result = await query
        .ProjectTo<TResult>(_mapper.ConfigurationProvider)
        .ToListAsync();

      if (result.Count == 0)
        throw new InvalidOperationException("No se ha encontrado ningún resultado.");

      return result;
    }

    public async Task<T> AddAsync(T entity)
    {
      try
      {
        await _context.AddAsync(entity);
        await _context.SaveChangesAsync();
        return entity;
      }
      catch (DbUpdateException ex)
      {
        throw new InvalidOperationException($"No se pudo insertar {typeof(T).Name}.", ex);
      }
    }

    public async Task<TResult> AddAsync<TSource, TResult>(TSource source)
    {
      var entity = _mapper.Map<T>(source);
      await _context.AddAsync(entity);
      await _context.SaveChangesAsync();
      return _mapper.Map<TResult>(entity);
    }

    public async Task DeleteAsync(params object[] keyValues)
    {
      var entity = await GetAsync(keyValues);
      if (entity is null) return;

      _context.Set<T>().Remove(entity);
      await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(T entity)
    {
      _context.Update(entity);
      await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync<TSource>(object key, TSource source)
    {
      var entity = await GetAsync(key);
      if (entity is null)
        throw new KeyNotFoundException($"No se encontró {typeof(T).Name} con la clave especificada.");

      _mapper.Map(source, entity);
      _context.Update(entity);
      await _context.SaveChangesAsync();
    }

    public async Task<bool> Exists(params object[] keyValues)
    {
      var entity = await GetAsync(keyValues);
      return entity != null;
    }

    public async Task<T?> GetLastAsync(string orderByProperty)
    {
      if (string.IsNullOrWhiteSpace(orderByProperty))
        throw new ArgumentException("Nombre de propiedad inválido.", nameof(orderByProperty));

      return await _context.Set<T>()
        .OrderByDescending(x => EF.Property<object>(x, orderByProperty))
        .FirstOrDefaultAsync();
    }
  }
}