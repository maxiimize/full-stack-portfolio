namespace Portfolio.Api.Models;

public class Project
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string DescriptionMarkdown { get; set; } = string.Empty;

    public string? RepoUrl { get; set; }

    public string? LiveUrl { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<Tag> Tags { get; set; } = [];

    public ICollection<Screenshot> Screenshots { get; set; } = [];
}
