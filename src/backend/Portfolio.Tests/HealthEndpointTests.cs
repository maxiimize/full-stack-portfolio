using System.Net;
using System.Text.Json;
using FluentAssertions;
using Portfolio.Tests.Fixtures;

namespace Portfolio.Tests;

public class HealthEndpointTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public HealthEndpointTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Health_ReturnsOk()
    {
        var response = await _client.GetAsync("/health");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Health_ContainsDatabaseStatusField()
    {
        var response = await _client.GetAsync("/health");
        var content = await response.Content.ReadAsStringAsync();

        using var doc = JsonDocument.Parse(content);
        var root = doc.RootElement;

        root.TryGetProperty("checks", out var checks).Should().BeTrue();
        var databaseCheck = checks.EnumerateArray()
            .FirstOrDefault(c => c.GetProperty("name").GetString() == "database");
        databaseCheck.ValueKind.Should().NotBe(JsonValueKind.Undefined);
        databaseCheck.GetProperty("status").GetString().Should().Be("Healthy");
    }
}
