using FinanceProject.Data;
using FinanceProject.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceApp.Data.CosmosRepo
{
		public class VendorRepo : IVendorRepo
		{
				private AppDbContext _context;
				private ILogger<VendorRepo> _logger;

				public VendorRepo(AppDbContext context, ILogger<VendorRepo> logger)
				{
						_context = context;
						_logger = logger;
				}

				public bool CreateVendor(Vendor vendor)
				{
						try
						{
								_context.Vendors!.AddAsync(vendor).AsTask().Wait();
								_context.SaveChangesAsync().Wait();
								return true;
						}
						catch (Exception ex)
						{
								_logger.LogError(ex, ex.Message, vendor);
								throw;
						}
				}

				public IEnumerable<Vendor> GetVendors()
				{
						try
						{
								var task = _context.Vendors!.ToArrayAsync();
								task.Wait();
								return task.Result;
						}
						catch (Exception ex)
						{
								_logger.LogError(ex, ex.Message);
								throw;
						}
				}

				public Vendor? GetOne(Guid id)
				{
						var task = _context.Vendors!.Where(e => e.Id == id).FirstOrDefaultAsync();
						task.Wait();
						return task.Result;
				}
		}
}
