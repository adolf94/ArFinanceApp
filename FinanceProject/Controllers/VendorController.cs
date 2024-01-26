using FinanceProject.Data;
using FinanceProject.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FinanceProject.Controllers
{
		[Route("api")]
		[ApiController]
		public class VendorController : ControllerBase
		{
				private IVendorRepo _repo;

				public VendorController(IVendorRepo repo)
				{
						_repo = repo;
				}

				[HttpGet("vendors")]
				public async Task<IActionResult> GetAll()
				{
						return await Task.FromResult(Ok(_repo.GetVendors()));
				}


				[HttpGet("vendors/{id}")]
				public async Task<IActionResult> GetOne(Guid id)
				{
						Vendor? vendor = _repo.GetOne(id);
						if(vendor == null) return NotFound();
						return await Task.FromResult(Ok(vendor));
				}


				[HttpPost("vendors")]
				public async Task<IActionResult> CreateVendor([FromBody] Vendor vendor)
				{

						bool result = _repo.CreateVendor(vendor);
						return await Task.FromResult(CreatedAtAction("GetOne", new { id = vendor.Id} , vendor));
				}
		}
}
