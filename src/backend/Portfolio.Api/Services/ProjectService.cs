using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Portfolio.Api.Data;
using Portfolio.Api.DTOs;
using Portfolio.Api.Models;

namespace Portfolio.Api.Services;

public class ProjectService : IProjectService
{
    private readonly AppDbContext _context;
    private readonly string _uploadsRoot;

    public ProjectService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _uploadsRoot = configuration["UPLOADS_PATH"]
            ?? Path.Combine(Directory.GetCurrentDirectory(), "uploads");
    }

    public async Task<PagedResult<ProjectResponse>> GetAllAsync(int page = 1, int pageSize = 10, string? tag = null)
    {
        var query = _context.Projects
            .Include(p => p.Tags)
            .Include(p => p.Screenshots.OrderBy(s => s.SortOrder))
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(tag))
        {
            query = query.Where(p => p.Tags.Any(t => t.Name == tag));
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<ProjectResponse>(
            items.Select(ToResponse).ToList(),
            totalCount,
            page,
            pageSize
        );
    }

    public async Task<ProjectResponse> CreateAsync(CreateProjectRequest request)
    {
        var project = new Project
        {
            Title = request.Title,
            Description = request.Description,
            LiveUrl = request.LiveUrl,
            SourceUrl = request.SourceUrl,
            CreatedAt = DateTime.UtcNow,
            Screenshots = request.Screenshots.Select(s => new Screenshot
            {
                Url = s.Url,
                AltText = s.AltText,
                SortOrder = s.SortOrder
            }).ToList()
        };

        // Resolve tags – reuse existing ones by name
        foreach (var tagName in request.Tags)
        {
            var existingTag = await _context.Tags
                .FirstOrDefaultAsync(t => t.Name == tagName);

            project.Tags.Add(existingTag ?? new Tag { Name = tagName });
        }

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        return ToResponse(project);
    }

    public async Task<ProjectResponse> UpdateAsync(int id, UpdateProjectRequest request)
    {
        var project = await _context.Projects
            .Include(p => p.Tags)
            .Include(p => p.Screenshots)
            .FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new KeyNotFoundException($"Project with id {id} not found.");

        // Update scalar properties
        project.Title = request.Title;
        project.Description = request.Description;
        project.LiveUrl = request.LiveUrl;
        project.SourceUrl = request.SourceUrl;

        // Update tags
        project.Tags.Clear();
        foreach (var tagName in request.Tags)
        {
            var existingTag = await _context.Tags
                .FirstOrDefaultAsync(t => t.Name == tagName);

            project.Tags.Add(existingTag ?? new Tag { Name = tagName });
        }

        // Replace screenshots
        _context.Screenshots.RemoveRange(project.Screenshots);
        project.Screenshots = request.Screenshots.Select(s => new Screenshot
        {
            Url = s.Url,
            AltText = s.AltText,
            SortOrder = s.SortOrder,
            ProjectId = id
        }).ToList();

        await _context.SaveChangesAsync();

        return ToResponse(project);
    }

    public async Task DeleteAsync(int id)
    {
        var project = await _context.Projects.FindAsync(id)
            ?? throw new KeyNotFoundException($"Project with id {id} not found.");

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
    }

    public async Task<ProjectResponse?> GetByIdAsync(int id)
    {
        var project = await _context.Projects
            .Include(p => p.Tags)
            .Include(p => p.Screenshots.OrderBy(s => s.SortOrder))
            .FirstOrDefaultAsync(p => p.Id == id);

        return project is null ? null : ToResponse(project);
    }

    public async Task<PagedResult<ProjectResponse>> SearchAsync(SearchProjectsRequest request)
    {
        var query = _context.Projects
            .Include(p => p.Tags)
            .Include(p => p.Screenshots.OrderBy(s => s.SortOrder))
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Title))
        {
            query = query.Where(p => p.Title.Contains(request.Title));
        }

        if (!string.IsNullOrWhiteSpace(request.Tag))
        {
            query = query.Where(p => p.Tags.Any(t => t.Name == request.Tag));
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        return new PagedResult<ProjectResponse>(
            items.Select(ToResponse).ToList(),
            totalCount,
            request.Page,
            request.PageSize
        );
    }

    public async Task<ScreenshotDto> UploadScreenshotAsync(int projectId, IFormFile file, string? altText, int sortOrder)
    {
        var project = await _context.Projects.FindAsync(projectId)
            ?? throw new KeyNotFoundException($"Project with id {projectId} not found.");

        var projectDir = Path.Combine(_uploadsRoot, projectId.ToString());
        Directory.CreateDirectory(projectDir);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(projectDir, fileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        var screenshot = new Screenshot
        {
            Url = $"/uploads/{projectId}/{fileName}",
            AltText = altText,
            SortOrder = sortOrder,
            ProjectId = projectId
        };

        _context.Screenshots.Add(screenshot);
        await _context.SaveChangesAsync();

        return new ScreenshotDto(screenshot.Id, screenshot.Url, screenshot.AltText, screenshot.SortOrder);
    }

    public async Task DeleteScreenshotAsync(int projectId, int screenshotId)
    {
        var screenshot = await _context.Screenshots
            .FirstOrDefaultAsync(s => s.Id == screenshotId && s.ProjectId == projectId)
            ?? throw new KeyNotFoundException($"Screenshot with id {screenshotId} not found for project {projectId}.");

        // Delete the physical file
        var filePath = Path.Combine(_uploadsRoot, screenshot.Url.TrimStart('/').Replace('/', Path.DirectorySeparatorChar)
            .Replace("uploads" + Path.DirectorySeparatorChar, ""));
        if (File.Exists(filePath))
            File.Delete(filePath);

        _context.Screenshots.Remove(screenshot);
        await _context.SaveChangesAsync();
    }

    public async Task<List<ScreenshotDto>> ReorderScreenshotsAsync(int projectId, List<int> screenshotIds)
    {
        var project = await _context.Projects
            .Include(p => p.Screenshots)
            .FirstOrDefaultAsync(p => p.Id == projectId)
            ?? throw new KeyNotFoundException($"Project with id {projectId} not found.");

        for (var i = 0; i < screenshotIds.Count; i++)
        {
            var screenshot = project.Screenshots.FirstOrDefault(s => s.Id == screenshotIds[i])
                ?? throw new KeyNotFoundException($"Screenshot with id {screenshotIds[i]} not found for project {projectId}.");
            screenshot.SortOrder = i;
        }

        await _context.SaveChangesAsync();

        return project.Screenshots
            .OrderBy(s => s.SortOrder)
            .Select(s => new ScreenshotDto(s.Id, s.Url, s.AltText, s.SortOrder))
            .ToList();
    }

    private static ProjectResponse ToResponse(Project project) => new(
        project.Id,
        project.Title,
        project.Description,
        project.LiveUrl,
        project.SourceUrl,
        project.CreatedAt,
        project.Tags.Select(t => t.Name).ToList(),
        project.Screenshots.Select(s => new ScreenshotDto(s.Id, s.Url, s.AltText, s.SortOrder)).ToList()
    );
}
