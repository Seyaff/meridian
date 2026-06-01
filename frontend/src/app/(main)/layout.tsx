import AppShell from "@/components/layout/app-shell";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="h-screen w-full overflow-hidden bg-background">
      <AppShell>{children}</AppShell>
    </main>
  );
}
