using Microsoft.AspNetCore.Http;
using Portfolio.Api.DTOs;

namespace Portfolio.Api.Services;

public interface IProjectService
{
    Task<PagedResult<ProjectResponse>> GetAllAsync(int page = 1, int pageSize = 10, string? tag = null);
    Task<ProjectResponse> CreateAsync(CreateProjectRequest request);
    Task<ProjectResponse> UpdateAsync(int id, UpdateProjectRequest request);
    Task DeleteAsync(int id);
    Task<ProjectResponse?> GetByIdAsync(int id);
    Task<PagedResult<ProjectResponse>> SearchAsync(SearchProjectsRequest request);
    Task<ScreenshotDto> UploadScreenshotAsync(int projectId, IFormFile file, string? altText, int sortOrder);
}
