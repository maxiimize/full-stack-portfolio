using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Models;

namespace Portfolio.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<Screenshot> Screenshots => Set<Screenshot>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Project -> Screenshots (one-to-many)
        modelBuilder.Entity<Project>()
            .HasMany(p => p.Screenshots)
            .WithOne(s => s.Project)
            .HasForeignKey(s => s.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        // Project <-> Tags (many-to-many)
        modelBuilder.Entity<Project>()
            .HasMany(p => p.Tags)
            .WithMany(t => t.Projects)
            .UsingEntity(j => j.ToTable("ProjectTags"));
    }
}
