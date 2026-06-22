import { getTuitionStatusByPeriod, getMonthlyFinancialSummary } from '@/lib/actions/finance';
import { getRecentTransactions, getExpensesByCategory, getAccounts } from '@/lib/actions/finance-erp';
import FinanceDashboard from './FinanceDashboard';

export default async function FinancePage() {
  const now = new Date();
  // We use YYYY-MM as the period format
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const currentPeriod = `${year}-${month}`; // e.g. "2023-10"

  const rawTuitionStatus = await getTuitionStatusByPeriod(currentPeriod);
  const rawSummary = await getMonthlyFinancialSummary(currentPeriod);
  const rawRecentTransactions = await getRecentTransactions(5);
  const rawExpensesByCategory = await getExpensesByCategory(currentPeriod);
  const rawAccounts = await getAccounts();

  const tuitionStatus = JSON.parse(JSON.stringify(rawTuitionStatus));
  const summary = JSON.parse(JSON.stringify(rawSummary));
  const recentTransactions = JSON.parse(JSON.stringify(rawRecentTransactions));
  const expensesByCategory = JSON.parse(JSON.stringify(rawExpensesByCategory));
  const accounts = JSON.parse(JSON.stringify(rawAccounts));

  return (
    <FinanceDashboard 
      tuitionStatus={tuitionStatus} 
      summary={summary} 
      currentPeriod={currentPeriod}
      recentTransactions={recentTransactions}
      expensesByCategory={expensesByCategory}
      accounts={accounts}
    />
  );
}
