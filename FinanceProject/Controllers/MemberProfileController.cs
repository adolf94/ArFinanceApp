using FinanceApp.Data;
using FinanceApp.Dto;
using FinanceApp.Models;
using FinanceApp.Utilities;
using FinanceProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using AutoMapper;
using FinanceApp.Models.SubModels;

namespace FinanceApp.Controllers
{
		[ApiController]
		[Authorize]
		[Route("api")]
		public class MemberProfileController : ControllerBase
		{
				private readonly IMemberProfileRepo _repo;
				private readonly IUserRepo _user;
				private readonly IMapper _mapper;
				private readonly ILedgerEntryRepo _ledger;
				private readonly ILedgerAcctRepo _ledgerAcct;

				public MemberProfileController(IMemberProfileRepo repo, IUserRepo user, IMapper mapper, ILedgerEntryRepo ledger, ILedgerAcctRepo ledgerAcct)
				{
						_repo = repo;
						_user = user;
						_mapper = mapper;
						_ledger = ledger;
						_ledgerAcct = ledgerAcct;
						
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
						string? currentUser = HttpContext.User.FindFirstValue("userId");

						User? user = await _user.GetById(userId);
						if (user == null) return NotFound();


						MemberProfile? item = await _repo.GetMemberProfiles(app, year, userId);
						if (item != null) return Conflict();

						CoopOption? option = await _repo.GetCoopOptions(app, year)!;
						if (option == null) return NotFound();

						if (!user.Roles.Any(role=> role == $"{app.ToUpper()}_{AppRoles.COOP_MEMBER}" || role == AppRoles.COOP_MEMBER))
						{
								user.Roles = user.Roles.Append($"{app.ToUpper()}_{AppRoles.COOP_MEMBER}").ToArray();
						}

						MemberProfile profile = new MemberProfile
						{
								AppId = option!.AppId,
								Year = option!.Year,
								UserId = userId,
								InitialAmount = option!.InitialAmount * dto.Shares,
								Increments = option.Increments,
								Shares = dto.Shares,
								InstallmentCount = option.InstallmentCount,
								FirstInstallment = option.FirstInstallment
						};

						LedgerAccount loans = new LedgerAccount
						{
							AddedBy = Guid.Parse(currentUser!),
							DateAdded = DateTime.UtcNow,
							Balance = 0,
							LedgerAcctId = Guid.NewGuid(),
							Name = $"Contrib - {user.Name}",
							Section = "equity"
						};
						user.AcctEquityId = loans.LedgerAcctId;
						await _ledgerAcct.CreateLedgerAccount(loans);	
						await _repo.PostProfile(profile);
						return Ok(profile);

				}
				[HttpPost("users/{userId}/memberProfiles/{year}/contributions")]
				public async Task<IActionResult> PostContributions(int year, Guid userId, [FromBody] NewContributionDto contribution)
				{
						string? app = HttpContext.User!.FindFirstValue("app")!;
						string? currentUser = HttpContext.User.FindFirstValue("userId");

						MemberProfile? item = await _repo.GetMemberProfiles(app, year, userId);
						if (item == null) return NotFound();

						
						
						
						MemberProfile.Contribution? dbContribution = item.Contributions.FirstOrDefault(e => e.Index == contribution.Index);
						if (dbContribution != null) return Conflict();
						MemberProfile.Contribution newItem = _mapper.Map<MemberProfile.Contribution>(contribution);
						
						User? user = await _user.GetById(userId);

						LedgerEntry entry = new LedgerEntry
						{
							EntryGroupId = item.Id,
							AddedBy = Guid.Parse(currentUser!),
							CreditId = user!.AcctEquityId!.Value,
							DebitId = contribution.DestinationAccount,
							Amount = contribution.Amount,
							Date = contribution.Date,
							MonthGroup = contribution.Date.ToString("yyyy-MM"),
							RelatedEntries =
							[
								new LedgerEntryTransaction
									{ TransactionId = newItem.Id, Type = EntryTransactionTypes.Contribution }
							],
							Description = $"Member {user.Name} contribution #{contribution.Index}. Date: {contribution.Date}"
						};

						newItem.EntryId = entry.EntryId;
						await _ledger.CreateAsync(entry, false);
						item.Contributions.Add(newItem);

						await _repo.UpdateProfile(item);

						var debitAcct = await _ledgerAcct.GetOne(entry.DebitId);
						var creditAcct = await _ledgerAcct.GetOne(entry.CreditId);
						
						
						return Ok(
						new {
							status="ok",
							item,
							relatedEntities = new {
								ledgerEntry = new []{ entry },
								ledgerAccount = new [] {debitAcct, creditAcct } 
							}	
						});

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
