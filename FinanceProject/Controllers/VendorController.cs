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
						return await Task.FromResult(Ok(_repo.GetVendors()));
				}


				[HttpPost("vendors")]
				public async Task<IActionResult> CreateVendor(Vendor vendor)
				{

						bool result = _repo.CreateVendor(vendor);
						return await Task.FromResult(CreatedAtAction("GetOne", new { id = vendor.Id} , vendor));
				}
		}
}
