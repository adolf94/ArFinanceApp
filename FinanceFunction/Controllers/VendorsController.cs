using FinanceFunction.Data;
using FinanceFunction.Models;
using FinanceFunction.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace FinanceFunction.Controllers;

public class VendorsController
{
    private readonly ILogger<VendorsController> _logger;
		private readonly IVendorRepo _repo;
		private readonly CurrentUser _user;
		private readonly string RequiredRole = "finance_user";

		public VendorsController(ILogger<VendorsController> logger, IVendorRepo repo, CurrentUser user)
    {
        _logger = logger;
        _repo = repo;
				_user = user;
    }

    [Function("GetAllVendors")]
    public async Task<IActionResult> GetAllVendors([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "vendors")] 
    HttpRequest req)
		{
				if (!_user.IsAuthorized(RequiredRole)) return new ForbidResult();
				return await Task.FromResult(new OkObjectResult(_repo.GetVendors()));
    }

		[Function("GetOneVendor")]
		public async Task<IActionResult> GetOneVendor([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "vendors/{id}")]
		HttpRequest req, Guid id)
		{
				if (!_user.IsAuthorized(RequiredRole)) return new ForbidResult();
				Vendor? vendor = _repo.GetOne(id);
				if (vendor == null) return new NotFoundResult();
				return await Task.FromResult(new OkObjectResult(vendor));
		}

    [Function("CreateVendor")]
    public async Task<IActionResult> CreateVendor([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "vendors")]
        HttpRequest req)
		{
				if (!_user.IsAuthorized(RequiredRole)) return new ForbidResult();
				var vendor = await req.ReadFromJsonAsync<Vendor>()!;
        if (vendor == null) return new BadRequestResult();
				bool result = _repo.CreateVendor(vendor!);
				return await Task.FromResult(new CreatedAtRouteResult("vendors/{id}", new { id = vendor.Id }, vendor));
		}

}