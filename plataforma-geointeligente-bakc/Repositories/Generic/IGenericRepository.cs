using System.Collections.Generic;
using System.Threading.Tasks;

namespace SaludPublicaBackend.Repositories.Generic
{
  public interface IGenericRepository<T> where T : class
  {
    Task<T?> GetAsync(params object[] keyValues);
    Task<TResult> GetAsync<TResult>(params object[] keyValues);
    Task<List<T>> GetAllAsync();
    Task<List<TResult>> GetAllAsync<TResult>();
    Task<List<TResult>> GetAllEnabledAsync<TResult>();
    Task<T> AddAsync(T entity);
    Task<TResult> AddAsync<TSource, TResult>(TSource source);
    Task DeleteAsync(params object[] keyValues);
    Task UpdateAsync(T entity);
    Task UpdateAsync<TSource>(object key, TSource source);
    Task<bool> Exists(params object[] keyValues);
    Task<T?> GetLastAsync(string orderByProperty);
  }
}