import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CovenantProof | Agentic Credit Audit Engine",
  description: "Deterministic, evidence-grounded financial covenant analysis powered by fine-tuned local models on AWS GPU.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased min-h-screen flex flex-col`}>
        <PostHogProvider>
          <Navbar />
          <main className="flex-1 flex flex-col relative overflow-hidden">
            {children}
          </main>
          {/* Floating Peer Review / Recruiter Feedback Desk */}
          <FeedbackModal />
        </PostHogProvider>
      </body>
    </html>
  );
}
