import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flight Search - Find the Best Deals",
  description: "Search and compare flight prices across airlines",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased`}>
        <header className="bg-transparent absolute top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-white drop-shadow">
                  SkySearch
                </span>
              </div>
              <nav className="flex items-center gap-6">
                <a href="#" className="text-sm text-white/80 hover:text-white transition-colors hidden sm:block">Support</a>
                <a href="#" className="text-sm text-white/80 hover:text-white transition-colors hidden sm:block">Deals</a>
                <a href="#" className="text-sm font-medium text-white hover:text-white/90 transition-colors">Log in</a>
                <a href="#" className="text-sm font-medium px-4 py-2 bg-white text-slate-900 rounded-lg hover:bg-white/90 transition-colors">Sign up</a>
              </nav>
            </div>
          </div>
        </header>
        <main className="min-h-screen relative overflow-hidden pt-16">
          <div className="absolute inset-0 bg-slate-100" />
          <div className="absolute inset-x-0 top-0 h-[420px] overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1920&q=80')" }}
            />
            <div className="absolute inset-0 bg-slate-900/40" />
          </div>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-float" />
            <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-float-slow" />
            <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-float-delayed" />
          </div>
          <div className="relative z-10">{children}</div>
        </main>
      </body>
    </html>
  );
}
