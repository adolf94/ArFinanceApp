using FinanceProject.Models;

namespace FinanceProject.Data
{
		public interface IVendorRepo
		{
				public IEnumerable<Vendor> GetVendors();
				public bool CreateVendor(Vendor vendor);
		}
}
