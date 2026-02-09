using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Data;
using Portfolio.Api.DTOs;
using Portfolio.Api.Models;

namespace Portfolio.Api.Services;

public class ProjectService : IProjectService
{
    private readonly AppDbContext _context;

    public ProjectService(AppDbContext context)
    {
        _context = context;
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

    private static ProjectResponse ToResponse(Project project) => new(
        project.Id,
        project.Title,
        project.Description,
        project.LiveUrl,
        project.SourceUrl,
        project.CreatedAt,
        project.Tags.Select(t => t.Name).ToList(),
        project.Screenshots.Select(s => new ScreenshotDto(s.Url, s.AltText, s.SortOrder)).ToList()
    );
}
