import { getExpenses, getAccounts } from '@/lib/actions/finance-erp';
import ExpensesManager from './ExpensesManager';

export default async function ExpensesPage() {
  const rawExpenses = await getExpenses();
  const rawAccounts = await getAccounts();
  
  // Serialize dates to strings to prevent React Date object rendering errors in Client Components
  const expenses = JSON.parse(JSON.stringify(rawExpenses));
  const accounts = JSON.parse(JSON.stringify(rawAccounts));
  
  const totalExpenses = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);

  return <ExpensesManager expenses={expenses} accounts={accounts} totalExpenses={totalExpenses} />;
}
