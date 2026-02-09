using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Data;
using Portfolio.Api.Models;

namespace Portfolio.Api.Repositories;

public class ProjectRepository : IRepository<Project>
{
    private readonly AppDbContext _context;

    public ProjectRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Project>> GetAll()
    {
        return await _context.Projects
            .Include(p => p.Tags)
            .Include(p => p.Screenshots.OrderBy(s => s.SortOrder))
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<Project?> GetById(int id)
    {
        return await _context.Projects
            .Include(p => p.Tags)
            .Include(p => p.Screenshots.OrderBy(s => s.SortOrder))
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task Add(Project entity)
    {
        // Attach existing tags to avoid duplicates
        foreach (var tag in entity.Tags)
        {
            var existingTag = await _context.Tags
                .FirstOrDefaultAsync(t => t.Name == tag.Name);

            if (existingTag != null)
            {
                _context.Entry(tag).State = EntityState.Unchanged;
                entity.Tags.Remove(tag);
                entity.Tags.Add(existingTag);
            }
        }

        _context.Projects.Add(entity);
        await _context.SaveChangesAsync();
    }

    public async Task Update(Project entity)
    {
        var existing = await _context.Projects
            .Include(p => p.Tags)
            .Include(p => p.Screenshots)
            .FirstOrDefaultAsync(p => p.Id == entity.Id)
            ?? throw new KeyNotFoundException($"Project with id {entity.Id} not found.");

        // Update scalar properties
        _context.Entry(existing).CurrentValues.SetValues(entity);

        // Update tags – resolve existing ones by name
        existing.Tags.Clear();
        foreach (var tag in entity.Tags)
        {
            var existingTag = await _context.Tags
                .FirstOrDefaultAsync(t => t.Name == tag.Name);

            existing.Tags.Add(existingTag ?? tag);
        }

        // Update screenshots – replace the collection
        _context.Screenshots.RemoveRange(existing.Screenshots);
        foreach (var screenshot in entity.Screenshots)
        {
            screenshot.ProjectId = existing.Id;
            existing.Screenshots.Add(screenshot);
        }

        await _context.SaveChangesAsync();
    }

    public async Task Delete(int id)
    {
        var project = await _context.Projects.FindAsync(id)
            ?? throw new KeyNotFoundException($"Project with id {id} not found.");

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
    }
}
