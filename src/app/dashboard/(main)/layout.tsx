import DashboardShell from "../_components/DashboardShell";

export default function DashboardMainLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
