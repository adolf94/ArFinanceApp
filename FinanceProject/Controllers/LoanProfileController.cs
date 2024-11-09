using FinanceApp.Data;
using FinanceApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FinanceApp.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api")]
		public class LoanProfileController : ControllerBase
		{
				private readonly ILoanProfileRepo _repo;

				public LoanProfileController(ILoanProfileRepo repo)
        {
                _repo = repo;
        }


        [HttpGet("loanprofile")]
        public async Task<IActionResult> GetAll()
        {
            string? appId = HttpContext.User.FindFirstValue("app");
            if (string.IsNullOrEmpty(appId)) return Forbid();


            IEnumerable<LoanProfile> profiles = await _repo.GetAll(appId);

            return Ok(profiles);
        }

        [HttpGet("loanprofile/{id}")]
        public  async Task<IActionResult> GetOne(Guid id)
        {

						string? appId = HttpContext.User.FindFirstValue("app");
						if (string.IsNullOrEmpty(appId)) return Forbid();
            LoanProfile? profile = await _repo.GetOneProfile(appId, id);


            if(profile == null) return NotFound();
            if (profile.AppId != appId) return Forbid();
            return Ok(profile);


				}

				[HttpPost("loanprofile")]
				public async Task<IActionResult> Create([FromBody] LoanProfile profile)
				{
						string? appId = HttpContext.User.FindFirstValue("app");
						if (string.IsNullOrEmpty(appId)) return Forbid();
            profile.AppId = appId;


						await _repo.CreateNewProfile(profile);

            return CreatedAtAction("GetOne", new { id = profile.ProfileId}, profile);

        }

    }
}
