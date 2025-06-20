﻿using FinanceFunction.Models;

namespace FinanceFunction.Data
{
		public interface IVendorRepo
		{
				public IEnumerable<Vendor> GetVendors();
				public Vendor? GetOne(Guid id);
				public bool CreateVendor(Vendor vendor);
		}
}
