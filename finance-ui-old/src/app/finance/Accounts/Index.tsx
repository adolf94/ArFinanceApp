import React from 'react';
import AccountsList from './AccountsList';
import TopNav from './TopNav';
import AccountTotals from './AccountTotals';

function AccountsPage() {
  return (
    <div>
      <TopNav />
      <AccountTotals />
      <AccountsList />
    </div>
  );
}

export default AccountsPage;