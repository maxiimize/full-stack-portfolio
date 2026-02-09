namespace Portfolio.Api.Models;

public class Screenshot
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public int SortOrder { get; set; }

    // Foreign key
    public int ProjectId { get; set; }

    // Navigation property
    public Project Project { get; set; } = null!;
}
