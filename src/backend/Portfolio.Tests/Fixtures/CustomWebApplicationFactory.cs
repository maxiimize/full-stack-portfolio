using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Portfolio.Api.Data;

namespace Portfolio.Tests.Fixtures;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = "TestDb_" + Guid.NewGuid().ToString();

    public string UploadsPath { get; } = Path.Combine(Path.GetTempPath(), "portfolio_test_uploads_" + Guid.NewGuid().ToString("N"));

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.UseSetting("UPLOADS_PATH", UploadsPath);

        builder.ConfigureServices(services =>
        {
            // Remove all DbContext and EF Core registrations to avoid provider conflicts
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.RemoveAll<DbContextOptions>();
            services.RemoveAll<AppDbContext>();

            // Remove all EF Core provider-specific services (SqlServer, etc.)
            var efDescriptors = services
                .Where(d => d.ServiceType.FullName != null &&
                            (d.ServiceType.FullName.Contains("EntityFramework") ||
                             d.ServiceType.FullName.Contains("SqlServer")))
                .ToList();
            foreach (var descriptor in efDescriptors)
                services.Remove(descriptor);

            // Register AppDbContext with InMemory database
            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseInMemoryDatabase(_dbName);
            });

            // Ensure the database is created
            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.EnsureCreated();
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (Directory.Exists(UploadsPath))
            Directory.Delete(UploadsPath, recursive: true);
    }
}
