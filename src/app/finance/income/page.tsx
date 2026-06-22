import { getIncomeRecords, getAccounts } from '@/lib/actions/finance-erp';
import { getTuitionStatusByPeriod } from '@/lib/actions/finance';
import IncomeManager from './IncomeManager';

export default async function IncomePage() {
  const rawIncomes = await getIncomeRecords();
  const rawAccounts = await getAccounts();
  const incomes = JSON.parse(JSON.stringify(rawIncomes));
  const accounts = JSON.parse(JSON.stringify(rawAccounts));
  
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const currentPeriod = `${year}-${month}`; // e.g. "2023-10"
  
  const rawTuitionStatus = await getTuitionStatusByPeriod(currentPeriod);
  const tuitionStatus = JSON.parse(JSON.stringify(rawTuitionStatus));

  return (
    <IncomeManager 
      incomes={incomes} 
      tuitionStatus={tuitionStatus} 
      currentPeriod={currentPeriod} 
      accounts={accounts}
    />
  );
}
