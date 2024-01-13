import React from 'react';
import TopNav from './TopNav';
import ExpensesList from './ExpensesList';

function Expenses() {
  return (
    <>
      <TopNav></TopNav>
      <ExpensesList />
    </>
  );
}

export default Expenses;