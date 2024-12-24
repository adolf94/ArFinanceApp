using AutoMapper;
using FinanceApp.Data;
using FinanceApp.Dto;
using FinanceApp.Models;
using FinanceApp.Utilities;
using FinanceProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using FinanceApp.Models.SubModels;
using UUIDNext;

namespace FinanceApp.Controllers
{
		[ApiController]
		[Authorize(Roles = "REGISTERED")]
		[Route("api")]
		public class LoanController : ControllerBase
		{
				private readonly ILoanRepo _repo;
				private readonly ILogger<LoanController> _logger;
				private readonly IMapper _mapper;
				private readonly IPaymentRepo _payment;
				private readonly IUserRepo _user;
				private readonly Sms _sms;
				private readonly AppConfig _config;
				private readonly ILedgerAcctRepo _ledgeracct;
				private readonly ILedgerEntryRepo _ledger;

				public LoanController(ILoanRepo repo, IPaymentRepo payment, IUserRepo user,
					ILogger<LoanController> logger, IMapper mapper, Sms sms, AppConfig config, ILedgerAcctRepo ledgeracct, ILedgerEntryRepo ledger) 
				{
						_repo = repo;
						_logger = logger;
						_mapper = mapper;
						_payment = payment;
						_ledgeracct = ledgeracct;
						_user = user;
						_sms = sms;
						_ledger = ledger;
						_config = config;
				}

				[HttpPost("loan")]
				[Authorize(Roles = "MANAGE_LOAN")]
				public async Task<IActionResult> CreateLoan(CreateLoanDto loan)
				{

						string userId = HttpContext.User.FindFirstValue("userId")!;
						string appId = HttpContext.User.FindFirstValue("app")!;
						User? user = await _user.GetById(loan.UserId);
						if (user == null) return BadRequest();
						Loan newLoan = _mapper.Map<Loan>(loan);
						newLoan.CreatedBy = Guid.Parse(userId);
						newLoan.NextInterestDate = loan.Date;
						newLoan.NextComputeDate = loan.Date;
						newLoan.LastInterestDate = loan.Date;
						newLoan.AppId = appId;
						Guid ledgerId = Uuid.NewSequential();
						newLoan.LedgerEntryId = ledgerId;
						
						await _repo.CreateLoan(newLoan);

						if (!user.AcctReceivableId.HasValue)
						{
							LedgerAccount newacct = new LedgerAccount
							{
								AddedBy = Guid.Parse(userId),
								Balance = 0,
								DateAdded = DateTime.Now, 
								LedgerAcctId = Guid.NewGuid(), 
								Name = $"Receivables - {user.Name}",
								Section = "receivables"
							};
							
							user.AcctReceivableId = newacct.LedgerAcctId;
							await _ledgeracct.CreateLedgerAccount(newacct);
						}

						List<LedgerEntry> entries = new List<LedgerEntry>();

						
						LedgerEntry entry = new LedgerEntry
						{
							EntryId = ledgerId,
							EntryGroupId = ledgerId,
							AddedBy = Guid.Parse(userId),
							CreditId = loan.SourceAcctId,
							DebitId = user.AcctReceivableId.Value,
							Amount = loan.Principal,
							Date = loan.Date,
							MonthGroup = loan.Date.ToString("yyyy-MM"),
							RelatedEntries =
							[
								new LedgerEntryTransaction
									{ TransactionId = newLoan.Id, Type = EntryTransactionTypes.Loan }
							],
							Description = $"Loan Principal for Client {user.Name}. Date: {loan.Date}"
						};
						
						await _ledger.CreateAsync(entry, true);
						

						//send sms
						await _sms.SendSms($"We have recorded your loan of P {loan.Principal} with a monthly interest of {loan.LoanProfile.InterestPerMonth}% dated {loan.Date.ToString("MMM-dd")} "
								, user.MobileNumber, true);



						if (DateTime.Now > newLoan.Date.AddDays(1))
						{
								DateTime nextCompute = newLoan.NextInterestDate;
								while (nextCompute <= DateTime.Now)
								{
										var result = await _repo.ComputeInterests(newLoan, DateTime.Now);

										newLoan = result.NewLoanData;
										nextCompute = result.NextDate;

								}
						}

						if (newLoan!.Date.AddDays(-3) > DateTime.Now)
						{
							decimal totalInterest = newLoan.InterestRecords.Sum(e=>e.Amount);
							await _sms.SendSms($"Interest worth {totalInterest} was added to your loan dated {newLoan.Date.ToString("MMM-dd")}. " +
							                  $"This is not final if payments has been done between {newLoan.Date.ToString("MMM-dd")} and today"
								//$"for period {result.NewLoanData.LastInterestDate.ToString("MMM-d")} - {result.NewLoanData.NextInterestDate.ToString("MMM-d")}. \n"
								, user!.MobileNumber, false);

						}
						
						
						
						if (await _user.GetLastUrlReminder(newLoan.UserId, newLoan.AppId) <
						    DateTime.Now.AddDays(-3))
						{
													
							//get basePath from appconfig
							AppConfig.Application? app = _config.Apps.FirstOrDefault(e => e.App == newLoan.AppId);
							if (app != null)
							{
								await _sms.SendSms($"View outstanding loans at {app.RedirectUri}."
									, user!.MobileNumber);
							}
						}
						
						
						entries.Add(entry);
						foreach (var record in newLoan.InterestRecords)
						{
							var item = await _ledger.GetOne(record.LedgerEntryId);
							if(item != null) entries.Add(item);
						}

						var rcvAcct = await _ledgeracct.GetOne(user.AcctReceivableId.Value);
						var srcAcct = await _ledgeracct.GetOne(newLoan.SourceAcctId);
						var income = await _ledgeracct.GetOne(_repo.InterestIncomeId());
						


						var httpResult = new
						{
							item = newLoan,
							relatedEntities = new
							{
								ledgerEntry = entries,
								ledgerAccount = new[] { rcvAcct, srcAcct, income }
							}
						};
						
						
						//TODO SEND EMAIL AND SMS;
						//Reminder to reset interest on payment 
						return CreatedAtAction("GetOneLoan", new { id = newLoan.Id }, httpResult);
				}


				[HttpGet("member/{userId}/loan")]
				[Authorize(Roles = "COOP_MEMBER")]
				public async Task<IActionResult> GetByMember(Guid userId)
				{
						string currentUserId = HttpContext.User.FindFirstValue("userId")!;
						string App = HttpContext.User.FindFirstValue("app")!;



						var query = await _repo.GetLoansByMemberId(userId, App);
						var items = await query

								.Where(e => e.Status == "Active")

								.ToArrayAsync();

						items = items.Select(item =>
						{
								item.Payment = _payment.GetByLoanId(item.Id);
								return item;
						}).ToArray();

						return Ok(items);


				}





				[HttpGet("user/{userId}/loan")]
				public async Task<IActionResult> GetByUser(Guid userId)
				{
						string currentUserId = HttpContext.User.FindFirstValue("userId")!;
						string App = HttpContext.User.FindFirstValue("app")!;
						if (userId != Guid.Parse(currentUserId) && !HttpContext.User.IsInAppRole(AppRoles.MANAGE_LOAN))
						{
								return Forbid();
						}
						var query = await _repo.GetByUserId(userId, App);
						var items = await query

								.Where(e => e.Status == "Active")

								.ToArrayAsync();

						items = items.Select(item =>
						{
								item.Payment = _payment.GetByLoanId(item.Id);
								return item;
						}).ToArray();

						return Ok(items);


				}


				[HttpGet("loan/{id}")]
				public async Task<IActionResult> GetOneLoan(Guid id)
				{
						var item = await _repo.GetOneLoan(id);
						if (item == null) return NotFound();
						string currentUserId = HttpContext.User.FindFirstValue("userId")!;

						if (item.UserId != Guid.Parse(currentUserId) && !HttpContext.User.IsInAppRole(AppRoles.MANAGE_LOAN))
						{
								return Forbid();
						}
						item.Payment = _payment.GetByLoanId(item.Id);

						return await Task.FromResult(Ok(item));
				}

		}
		public class GetLoanQueryParams
		{
				public bool RemoveInactive { get; set; }
		}
}
