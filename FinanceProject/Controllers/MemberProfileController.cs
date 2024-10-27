using FinanceApp.Data;
using FinanceApp.Dto;
using FinanceApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FinanceApp.Controllers
{
		[ApiController]
		[Authorize]
		[Route("api")]
		public class MemberProfileController : ControllerBase
		{
				private readonly IMemberProfileRepo _repo;

				public MemberProfileController(IMemberProfileRepo repo)
				{
						_repo = repo;
				}

				[HttpGet("coopOptions/{year}")]
				public async Task<IActionResult> GetYearOption(int year)
				{
						string? app = HttpContext.User!.FindFirstValue("app")!;

						CoopOption? item = await _repo.GetCoopOptions(app, year);
						if (item == null) return NotFound();

						return Ok(item);
				}

				[HttpPut("coopOptions/{year}")]
				public async Task<IActionResult> CreateCoopOption([FromBody] CoopOption option, int year)
				{
						string? app = HttpContext.User!.FindFirstValue("app")!;
						if (string.IsNullOrEmpty(option.AppId)) option.AppId = app;
						if (option.AppId != app || option.Year != year) return BadRequest();

						CoopOption? item = await _repo.GetCoopOptions(app, year);
						if (item == null)
						{
								item = await _repo.CreateCoopOption(option);
						}
						else
						{
								item = await _repo.UpdateCoopOption(option);
						}

						return Ok(item);
				}

				[HttpGet("memberProfiles/{year}")]
				public async Task<IActionResult> GetYearProfiles(int year)
				{
						string? app = HttpContext.User!.FindFirstValue("app")!;

						IEnumerable<MemberProfile> items = await _repo.GetMemberProfiles(app, year);
						if (items == null) return NotFound();

						return Ok(items);

				}

				[HttpGet("users/{userId}/memberProfiles/{year}")]
				public async Task<IActionResult> GetYearProfile(int year, Guid userId)
				{
						string? app = HttpContext.User!.FindFirstValue("app")!;

						MemberProfile? item = await _repo.GetMemberProfiles(app, year, userId);
						if (item == null) return NotFound();

						return Ok(item);

				}


				[HttpPut("users/{userId}/memberProfiles/{year}")]
				public async Task<IActionResult> CreateMemberProfile(int year, Guid userId, CreateMemberProfileDto dto)
				{
						string? app = HttpContext.User!.FindFirstValue("app")!;

						MemberProfile? item = await _repo.GetMemberProfiles(app, year, userId);
						if (item != null) return Conflict();

						CoopOption? option = await _repo.GetCoopOptions(app, year)!;
						if (option == null) return NotFound();

						MemberProfile profile = new MemberProfile
						{
								AppId = option!.AppId,
								Year = option!.Year,
								UserId = userId,
								InitialAmount = option!.InitialAmount,
								Increments = option.Increments,
								Shares = dto.Shares,
								InstallmentCount = option.InstallmentCount,
								FirstInstallment = option.FirstInstallment
						};

						await _repo.PostProfile(profile);
						return Ok(profile);

				}
				[HttpPost("users/{userId}/memberProfiles/{year}/contributions")]
				public async Task<IActionResult> PostContributions(int year, Guid userId, MemberProfile.Contribution contribution)
				{
						string? app = HttpContext.User!.FindFirstValue("app")!;

						MemberProfile? item = await _repo.GetMemberProfiles(app, year, userId);
						if (item == null) return NotFound();

						return Ok(item);

				}
				[HttpGet("users/{userId}/memberProfiles/{year}/contributions")]
				public async Task<IActionResult> GetContributions(int year, Guid userId)
				{
						string? app = HttpContext.User!.FindFirstValue("app")!;

						MemberProfile? item = await _repo.GetMemberProfiles(app, year, userId);
						if (item == null) return NotFound();

						return Ok(item);

				}

		}
}
