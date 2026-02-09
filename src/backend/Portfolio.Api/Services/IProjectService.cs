using Portfolio.Api.DTOs;

namespace Portfolio.Api.Services;

public interface IProjectService
{
    Task<ProjectResponse> CreateAsync(CreateProjectRequest request);
    Task<ProjectResponse> UpdateAsync(int id, UpdateProjectRequest request);
    Task DeleteAsync(int id);
    Task<ProjectResponse?> GetByIdAsync(int id);
    Task<PagedResult<ProjectResponse>> SearchAsync(SearchProjectsRequest request);
}
