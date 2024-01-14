using FinanceProject.Models;
using Microsoft.EntityFrameworkCore;
using System.Numerics;

namespace FinanceProject.Data.SqlRepo
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
								_context.Vendors!.Add(vendor);
								_context.SaveChanges();
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
								return _context.Vendors!.ToArray();
						}
						catch (Exception ex)
						{
								_logger.LogError(ex, ex.Message);
								throw;
						}
				}
		}
}
