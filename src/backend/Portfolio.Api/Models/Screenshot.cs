namespace Portfolio.Api.Models;

public class Screenshot
{
    public int Id { get; set; }

    public int ProjectId { get; set; }

    public string FilePath { get; set; } = string.Empty;

    // Navigation property
    public Project Project { get; set; } = null!;
}
