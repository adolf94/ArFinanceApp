using FinanceApp.Data;
using FinanceApp.Dto;
using FinanceApp.Models;
using FinanceApp.Utilities;
using FinanceProject.Models;
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
				private readonly IUserRepo _user;

				public MemberProfileController(IMemberProfileRepo repo, IUserRepo user)
				{
						_repo = repo;
						_user = user;
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
						User? user = await _user.GetById(userId);
						if (user == null) return NotFound();


						MemberProfile? item = await _repo.GetMemberProfiles(app, year, userId);
						if (item != null) return Conflict();

						CoopOption? option = await _repo.GetCoopOptions(app, year)!;
						if (option == null) return NotFound();

						if (!user.Roles.Any(role=> role == $"{app.ToUpper()}_{AppRoles.COOP_MEMBER}" || role == AppRoles.COOP_MEMBER))
						{
								user.Roles = user.Roles.Append($"{app.ToLower()}_{AppRoles.COOP_MEMBER}").ToArray();
						}

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

						MemberProfile.Contribution? dbContribution = item.Contributions.FirstOrDefault(e => e.Index == contribution.Index);
						if (dbContribution != null) return Conflict();

						item.Contributions.Add(contribution);

						await _repo.UpdateProfile(item);


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
