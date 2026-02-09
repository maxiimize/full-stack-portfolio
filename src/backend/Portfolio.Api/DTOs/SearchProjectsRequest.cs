namespace Portfolio.Api.DTOs;

public record SearchProjectsRequest(
    string? Title,
    string? Tag,
    int Page = 1,
    int PageSize = 10
);
