using System.ComponentModel.DataAnnotations;

namespace Portfolio.Api.DTOs;

public record UpdateProjectRequest(
    [Required, MaxLength(200)] string Title,
    [Required] string Description,
    string? LiveUrl,
    string? SourceUrl,
    List<string> Tags,
    List<ScreenshotDto> Screenshots
);
