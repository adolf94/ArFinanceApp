using FinanceApp.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceApp.Controllers
{
    [ApiController]
    [Authorize(Roles = "FINANCE_USER")]
    [Route("api")]
    public class HookReferenceController : ControllerBase
    {
        private readonly IHookReferenceRepo _repo;

        public HookReferenceController(IHookReferenceRepo repo)
        {
            _repo = repo;
        }

        [HttpGet("hookReference")]
        public async Task<IActionResult> GetHookReferences([FromQuery]GetHookReferenceQueryParams @params)
        {
           var items = await _repo.GetByName(@params.ReferenceName);


            return Ok(items);

        }


    }
    
    public class GetHookReferenceQueryParams
    {
        public string ReferenceName { get; set; } = "";
    }
}
