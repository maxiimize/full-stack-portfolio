namespace Portfolio.Api.DTOs;

public record ScreenshotDto(
    string Url,
    string? AltText,
    int SortOrder
);
