namespace Portfolio.Api.Models;

public class Tag
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    // Navigation property
    public ICollection<Project> Projects { get; set; } = [];
}
