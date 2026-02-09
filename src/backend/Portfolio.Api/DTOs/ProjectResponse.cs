namespace Portfolio.Api.DTOs;

public record ProjectResponse(
    int Id,
    string Title,
    string Description,
    string? LiveUrl,
    string? SourceUrl,
    DateTime CreatedAt,
    List<string> Tags,
    List<ScreenshotDto> Screenshots
);
