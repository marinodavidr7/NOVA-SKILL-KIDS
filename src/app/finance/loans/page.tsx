import { getLoans, getAccounts, getAllLoanPayments } from '@/lib/actions/finance-erp';
import LoansManager from './LoansManager';

export default async function LoansPage() {
  const loans = await getLoans();
  const accounts = await getAccounts();
  const payments = await getAllLoanPayments();

  return <LoansManager loans={loans} accounts={accounts} payments={payments} />;
}
