import AppShell from "@/components/layout/app-shell";
import LenisProvider from "@/components/providers/smooth-scroll-provider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="h-screen w-full overflow-hidden bg-background">
      <LenisProvider>
        <AppShell>{children}</AppShell>
      </LenisProvider>
    </main>
  );
}
