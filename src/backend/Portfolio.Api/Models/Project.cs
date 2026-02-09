namespace Portfolio.Api.Models;

public class Project
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? LiveUrl { get; set; }
    public string? SourceUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Screenshot> Screenshots { get; set; } = [];
    public ICollection<Tag> Tags { get; set; } = [];
}
