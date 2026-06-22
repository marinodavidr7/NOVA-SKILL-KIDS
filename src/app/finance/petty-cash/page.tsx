import { getPettyCash, getPettyCashTransactions } from '@/lib/actions/finance-erp';
import PettyCashManager from './PettyCashManager';

export const dynamic = 'force-dynamic';

export default async function PettyCashPage() {
  const rawPettyCashList = await getPettyCash();
  
  // For simplicity, we just take the first petty cash box
  const rawPettyCash = rawPettyCashList[0];
  
  const rawTransactions = rawPettyCash ? await getPettyCashTransactions(rawPettyCash.id) : [];

  // Prevent Date serialization bugs across boundary
  const pettyCash = JSON.parse(JSON.stringify(rawPettyCash || null));
  const transactions = JSON.parse(JSON.stringify(rawTransactions));

  return (
    <PettyCashManager pettyCash={pettyCash} transactions={transactions} />
  );
}
