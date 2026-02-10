using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Portfolio.Api.Data;
using Portfolio.Api.DTOs;
using Portfolio.Api.Models;
using Portfolio.Tests.Fixtures;

namespace Portfolio.Tests;

public class ProjectsGetTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public ProjectsGetTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    private void SeedProjects(Action<AppDbContext> seedAction)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        seedAction(db);
        db.SaveChanges();
    }

    private static List<Project> CreateProjectsWithTags(int count, params string[] tagNames)
    {
        var tags = tagNames.Select(name => new Tag { Name = name }).ToList();

        return Enumerable.Range(1, count).Select(i => new Project
        {
            Title = $"Project {i}",
            Description = $"Description for project {i}",
            LiveUrl = $"https://example.com/project-{i}",
            SourceUrl = $"https://github.com/user/project-{i}",
            CreatedAt = DateTime.UtcNow.AddDays(-i),
            Tags = tags,
            Screenshots = new List<Screenshot>
            {
                new()
                {
                    Url = $"https://example.com/screenshots/project-{i}.png",
                    AltText = $"Screenshot of project {i}",
                    SortOrder = 0
                }
            }
        }).ToList();
    }

    // ── Returns project list ──────────────────────────────────────────

    [Fact]
    public async Task GetAll_ReturnsProjectList_WithCorrectStructure()
    {
        // Arrange
        SeedProjects(db =>
        {
            var projects = CreateProjectsWithTags(3, "C#", "ASP.NET");
            db.Projects.AddRange(projects);
        });

        // Act
        var response = await _client.GetAsync("/api/projects");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<PagedResult<ProjectResponse>>();
        body.Should().NotBeNull();
        body!.Items.Should().NotBeEmpty();
        body.Items.Should().HaveCountGreaterThanOrEqualTo(3);
        body.TotalCount.Should().BeGreaterThanOrEqualTo(3);
        body.Page.Should().BeGreaterThanOrEqualTo(1);
        body.PageSize.Should().BeGreaterThan(0);

        var first = body.Items.First();
        first.Id.Should().BeGreaterThan(0);
        first.Title.Should().NotBeNullOrWhiteSpace();
        first.Description.Should().NotBeNullOrWhiteSpace();
        first.Tags.Should().NotBeNull();
        first.Screenshots.Should().NotBeNull();
    }

    [Fact]
    public async Task GetAll_ProjectResponse_ContainsAllExpectedFields()
    {
        // Arrange
        SeedProjects(db =>
        {
            db.Projects.Add(new Project
            {
                Title = "FieldCheck Project",
                Description = "Validates response fields",
                LiveUrl = "https://live.example.com",
                SourceUrl = "https://github.com/example",
                CreatedAt = DateTime.UtcNow,
                Tags = new List<Tag> { new() { Name = "TestTag" } },
                Screenshots = new List<Screenshot>
                {
                    new()
                    {
                        Url = "https://img.example.com/1.png",
                        AltText = "Alt text",
                        SortOrder = 1
                    }
                }
            });
        });

        // Act
        var response = await _client.GetAsync("/api/projects");
        var body = await response.Content.ReadFromJsonAsync<PagedResult<ProjectResponse>>();

        // Assert
        var project = body!.Items.First(p => p.Title == "FieldCheck Project");

        project.Id.Should().BeGreaterThan(0);
        project.Title.Should().Be("FieldCheck Project");
        project.Description.Should().Be("Validates response fields");
        project.LiveUrl.Should().Be("https://live.example.com");
        project.SourceUrl.Should().Be("https://github.com/example");
        project.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(5));
        project.Tags.Should().Contain("TestTag");
        project.Screenshots.Should().ContainSingle();
        project.Screenshots.First().Url.Should().Be("https://img.example.com/1.png");
        project.Screenshots.First().AltText.Should().Be("Alt text");
        project.Screenshots.First().SortOrder.Should().Be(1);
    }

    // ── Pagination works ──────────────────────────────────────────────

    [Fact]
    public async Task GetAll_Pagination_ReturnsRequestedPageSize()
    {
        // Arrange — seed enough projects for multiple pages
        SeedProjects(db =>
        {
            var projects = CreateProjectsWithTags(5, "Pagination");
            db.Projects.AddRange(projects);
        });

        // Act
        var response = await _client.GetAsync("/api/projects?page=1&pageSize=2");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<PagedResult<ProjectResponse>>();
        body.Should().NotBeNull();
        body!.Items.Should().HaveCount(2);
        body.Page.Should().Be(1);
        body.PageSize.Should().Be(2);
        body.TotalCount.Should().BeGreaterThanOrEqualTo(5);
        body.TotalPages.Should().BeGreaterThanOrEqualTo(3);
    }

    [Fact]
    public async Task GetAll_Pagination_SecondPageReturnsDifferentItems()
    {
        // Arrange
        SeedProjects(db =>
        {
            var projects = CreateProjectsWithTags(6, "PageTest");
            db.Projects.AddRange(projects);
        });

        // Act
        var page1Response = await _client.GetAsync("/api/projects?page=1&pageSize=3");
        var page2Response = await _client.GetAsync("/api/projects?page=2&pageSize=3");

        // Assert
        var page1 = await page1Response.Content.ReadFromJsonAsync<PagedResult<ProjectResponse>>();
        var page2 = await page2Response.Content.ReadFromJsonAsync<PagedResult<ProjectResponse>>();

        page1!.Items.Should().HaveCount(3);
        page2!.Items.Should().HaveCount(3);
        page2.Page.Should().Be(2);

        var page1Ids = page1.Items.Select(p => p.Id);
        var page2Ids = page2.Items.Select(p => p.Id);
        page1Ids.Should().NotIntersectWith(page2Ids);
    }

    [Fact]
    public async Task GetAll_Pagination_TotalPagesIsCorrect()
    {
        // Arrange
        SeedProjects(db =>
        {
            var projects = CreateProjectsWithTags(7, "TotalPages");
            db.Projects.AddRange(projects);
        });

        // Act
        var response = await _client.GetAsync("/api/projects?page=1&pageSize=3");
        var body = await response.Content.ReadFromJsonAsync<PagedResult<ProjectResponse>>();

        // Assert
        var expectedTotalPages = (int)Math.Ceiling(body!.TotalCount / 3.0);
        body.TotalPages.Should().Be(expectedTotalPages);
    }

    // ── Tag filtering works ───────────────────────────────────────────

    [Fact]
    public async Task GetAll_FilterByTag_ReturnsOnlyMatchingProjects()
    {
        // Arrange
        var uniqueTag = $"UniqueFilter-{Guid.NewGuid():N}"[..20];

        SeedProjects(db =>
        {
            var filterTag = new Tag { Name = uniqueTag };
            var otherTag = new Tag { Name = "OtherLang" };

            db.Projects.Add(new Project
            {
                Title = "Tagged Project A",
                Description = "Has the filter tag",
                Tags = new List<Tag> { filterTag }
            });
            db.Projects.Add(new Project
            {
                Title = "Tagged Project B",
                Description = "Also has the filter tag",
                Tags = new List<Tag> { filterTag }
            });
            db.Projects.Add(new Project
            {
                Title = "Unrelated Project",
                Description = "Does not have the filter tag",
                Tags = new List<Tag> { otherTag }
            });
        });

        // Act
        var response = await _client.GetAsync($"/api/projects?tag={uniqueTag}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<PagedResult<ProjectResponse>>();
        body.Should().NotBeNull();
        body!.Items.Should().HaveCountGreaterThanOrEqualTo(2);
        body.Items.Should().OnlyContain(p => p.Tags.Contains(uniqueTag));
    }

    [Fact]
    public async Task GetAll_FilterByTag_ReturnsEmptyWhenNoMatch()
    {
        // Act
        var response = await _client.GetAsync("/api/projects?tag=NonExistentTag-999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<PagedResult<ProjectResponse>>();
        body.Should().NotBeNull();
        body!.Items.Should().BeEmpty();
        body.TotalCount.Should().Be(0);
    }

    [Fact]
    public async Task GetAll_FilterByTag_WithPagination_WorksTogether()
    {
        // Arrange
        var paginatedTag = $"PagTag-{Guid.NewGuid():N}"[..16];

        SeedProjects(db =>
        {
            var tag = new Tag { Name = paginatedTag };

            for (var i = 1; i <= 4; i++)
            {
                db.Projects.Add(new Project
                {
                    Title = $"PagTagProject {i}",
                    Description = $"Pag+tag combo project {i}",
                    Tags = new List<Tag> { tag }
                });
            }
        });

        // Act
        var response = await _client.GetAsync($"/api/projects?tag={paginatedTag}&page=1&pageSize=2");

        // Assert
        var body = await response.Content.ReadFromJsonAsync<PagedResult<ProjectResponse>>();
        body.Should().NotBeNull();
        body!.Items.Should().HaveCount(2);
        body.TotalCount.Should().Be(4);
        body.Page.Should().Be(1);
        body.PageSize.Should().Be(2);
        body.Items.Should().OnlyContain(p => p.Tags.Contains(paginatedTag));
    }
}
