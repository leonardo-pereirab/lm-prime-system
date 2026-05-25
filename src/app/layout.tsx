import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/Tooltip";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata = {
  title: "LM Prime System",
  description: "Sistema de gestao de atendimentos e locacao de veiculos",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
