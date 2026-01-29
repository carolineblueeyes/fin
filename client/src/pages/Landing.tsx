import { Link } from "wouter";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">F</span>
            </div>
            <span className="font-display font-bold text-xl text-slate-900">Finance AI</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/api/login">
              <Button variant="ghost" className="hidden sm:flex">Log In</Button>
            </a>
            <a href="/api/login">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20">
                Get Started
              </Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 fade-in">
            <h1 className="text-5xl sm:text-6xl font-display font-bold text-slate-900 leading-[1.1]">
              Master your money with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">AI Intelligence</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
              Scan receipts instantly, track budgets automatically, and get personalized financial advice powered by artificial intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/api/login">
                <Button size="lg" className="w-full sm:w-auto text-lg h-12 px-8 bg-slate-900 hover:bg-slate-800">
                  Start for Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-12 px-8">
                View Demo
              </Button>
            </div>
            <div className="pt-4 flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Free forever plan
              </div>
            </div>
          </div>
          
          <div className="relative animate-in slide-in-from-right-8 duration-1000 fade-in delay-200 hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-teal-50 rounded-full blur-3xl opacity-50" />
            <div className="relative bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-2 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000" 
                alt="Financial Dashboard Preview" 
                className="rounded-xl w-full h-auto object-cover"
              />
              {/* Floating UI Elements */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce delay-700">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Daily Insight</p>
                  <p className="font-bold text-sm">Spending down 12%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold font-display mb-4">Everything you need to grow</h2>
            <p className="text-slate-600">Powerful features to help you take control of your financial future.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Scanning</h3>
              <p className="text-slate-600">
                Snap a photo of any receipt. Our AI instantly extracts data, categorizes items, and updates your budget.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure & Private</h3>
              <p className="text-slate-600">
                Bank-grade encryption keeps your data safe. We never sell your personal financial information.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Advisor</h3>
              <p className="text-slate-600">
                Get personalized tips on how to save more based on your unique spending patterns and goals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2024 Finance AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
