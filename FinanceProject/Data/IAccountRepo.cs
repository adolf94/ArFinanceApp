﻿using FinanceProject.Models;

namespace FinanceProject.Data
{
		public interface IAccountRepo
		{
				public ICollection<Account> GetAccounts(bool All);
				public Account UpdateDebitAcct(Guid debitId, decimal amount);
				public Account UpdateCreditAcct(Guid creditId, decimal amount);
				public bool Create(Account group);
				public Account? GetOne(Guid id);

		} 
}
