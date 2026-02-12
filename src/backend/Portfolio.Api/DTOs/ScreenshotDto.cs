namespace Portfolio.Api.DTOs;

public record ScreenshotDto(
    int Id,
    string Url,
    string? AltText,
    int SortOrder
);
