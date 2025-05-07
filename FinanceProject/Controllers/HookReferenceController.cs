using FinanceApp.Data;
using FinanceApp.Dto;
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
        public async Task<IActionResult> GetHookReferences([FromQuery] GetHookReferenceQueryParams @params)
        {
            var items = await _repo.GetByName(@params.ReferenceName);


            return Ok(items);

        }

        [HttpPut("hookReference")]
        public async Task<IActionResult> LogHookReference([FromBody] HookRefLogDto dto)
        {
            var items = await _repo.RecordReference(dto);


            return Ok(items);

        }


    }

    public class GetHookReferenceQueryParams
    {
        public string ReferenceName { get; set; } = "";
    }
}
