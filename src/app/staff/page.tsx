import { getStaff, getStaffSummary, getCurrentPayrollStatus } from '@/lib/actions/staff';
import PayrollDashboard from './PayrollDashboard';

export default async function StaffPage() {
  const staff = await getStaff();
  const summary = await getStaffSummary();
  
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const payrollStatus = await getCurrentPayrollStatus(periodStart, periodEnd);

  return <PayrollDashboard staff={staff} summary={summary} initialPayrollStatus={payrollStatus} periodStart={periodStart} periodEnd={periodEnd} />;
}
