import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/shell/app-shell";
import { getCurrentClient } from "@/lib/clients/session";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Painel — UPFlu",
  description: "Painel de clientes da UPFlu.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0d10",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const client = await getCurrentClient();

  const navItems = (client?.enabledModules ?? []).map((m) => {
    const Icon = m.icon;
    return {
      key: m.key,
      label: m.label,
      href: `/${m.key}`,
      icon: <Icon className="h-4 w-4" aria-hidden="true" />,
    };
  });

  return (
    <html
      lang="pt-BR"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppShell clientName={client?.clientName} navItems={navItems}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
