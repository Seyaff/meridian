import React from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen  h-screen w-full overflow-hidden bg-background">
      {children}
    </main>
  );
}
