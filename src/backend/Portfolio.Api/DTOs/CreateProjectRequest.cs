using System.ComponentModel.DataAnnotations;

namespace Portfolio.Api.DTOs;

public record CreateProjectRequest(
    [Required, MaxLength(200)] string Title,
    [Required] string Description,
    string? LiveUrl,
    string? SourceUrl,
    List<string> Tags,
    List<ScreenshotDto> Screenshots
);
