using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Portfolio.Api.DTOs;
using Portfolio.Api.Services;

namespace Portfolio.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ProjectResponse>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? tag = null)
    {
        return Ok(await _projectService.GetAllAsync(page, pageSize, tag));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProjectResponse>> GetById(int id)
    {
        var project = await _projectService.GetByIdAsync(id);
        return project is null ? NotFound() : Ok(project);
    }

    [HttpGet("search")]
    public async Task<ActionResult<PagedResult<ProjectResponse>>> Search(
        [FromQuery] SearchProjectsRequest request)
    {
        return Ok(await _projectService.SearchAsync(request));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<ProjectResponse>> Create(CreateProjectRequest request)
    {
        var project = await _projectService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<ActionResult<ProjectResponse>> Update(int id, UpdateProjectRequest request)
    {
        try
        {
            var project = await _projectService.UpdateAsync(id, request);
            return Ok(project);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _projectService.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
