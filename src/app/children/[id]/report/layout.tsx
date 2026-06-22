// No custom layout needed — AppShell in root layout handles hiding sidebar for /report routes
export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
