import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
  <div class="min-h-screen bg-gradient-to-br from-leaf-50 via-white to-emerald-50">
    <!-- Header -->
    <header class="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-10 h-10 rounded-xl bg-leaf-600 text-white grid place-items-center font-bold text-lg">A</div>
        <div>
          <div class="font-bold text-slate-900">AgriIntel-X</div>
          <div class="text-[10px] uppercase tracking-widest text-slate-500">AI Agricultural Intelligence</div>
        </div>
      </div>
      <nav class="hidden md:flex items-center gap-8 text-sm text-slate-600">
        <a href="#problem" class="hover:text-leaf-700">Problem</a>
        <a href="#solution" class="hover:text-leaf-700">Solution</a>
        <a href="#how" class="hover:text-leaf-700">How It Works</a>
        <a href="#features" class="hover:text-leaf-700">Features</a>
        <a href="#research" class="hover:text-leaf-700">Research</a>
      </nav>
      <div class="flex gap-2">
        <a routerLink="/login" class="btn-secondary">Login</a>
        <a routerLink="/register" class="btn-primary">Get Started</a>
      </div>
    </header>

    <!-- Hero -->
    <section class="max-w-7xl mx-auto px-6 pt-12 pb-20 grid md:grid-cols-2 gap-12 items-center">
      <div>
        <span class="badge-demo mb-4">Karnataka · Chilli Pilot</span>
        <h1 class="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">
          Turn Farm Data into <span class="text-leaf-700">Smarter Decisions</span>
        </h1>
        <p class="mt-6 text-lg text-slate-600 max-w-xl">
          AI-powered soil, weather, crop, yield, risk and profit intelligence for modern farming.
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a routerLink="/register" class="btn-primary text-base px-6 py-3">Explore Platform</a>
          <a routerLink="/register" class="btn-secondary text-base px-6 py-3">Try Chilli Pilot</a>
        </div>
        <div class="mt-10 grid grid-cols-3 gap-4 max-w-md">
          <div><div class="text-2xl font-bold text-slate-900">₹1.38L</div><div class="text-xs text-slate-500">Est. profit</div></div>
          <div><div class="text-2xl font-bold text-slate-900">5,240</div><div class="text-xs text-slate-500">kg/ha yield</div></div>
          <div><div class="text-2xl font-bold text-slate-900">Medium</div><div class="text-xs text-slate-500">Risk level</div></div>
        </div>
        <div class="mt-6"><span class="badge-demo">Demo / Simulated values for illustration</span></div>
      </div>

      <!-- Dashboard preview card -->
      <div class="relative">
        <div class="card shadow-xl border-leaf-100">
          <div class="flex items-center justify-between mb-4">
            <div class="text-sm font-semibold text-slate-500 uppercase">Farm Intelligence</div>
            <span class="badge-demo">Demo</span>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="p-3 rounded-xl bg-leaf-50">
              <div class="text-xs text-leaf-800">Soil Health</div>
              <div class="text-2xl font-bold text-leaf-900">78/100</div>
            </div>
            <div class="p-3 rounded-xl bg-amber-50">
              <div class="text-xs text-amber-800">Expected Yield</div>
              <div class="text-2xl font-bold text-amber-900">5,240 kg/ha</div>
            </div>
            <div class="p-3 rounded-xl bg-sky-50">
              <div class="text-xs text-sky-800">Expected Profit</div>
              <div class="text-2xl font-bold text-sky-900">₹1.38 L</div>
            </div>
            <div class="p-3 rounded-xl bg-rose-50">
              <div class="text-xs text-rose-800">Farm Risk</div>
              <div class="text-2xl font-bold text-rose-900">Medium</div>
            </div>
          </div>
          <div class="mt-4 h-32 rounded-xl bg-gradient-to-br from-leaf-100 to-emerald-200 grid place-items-center text-leaf-800 text-sm">
            [Yield forecast chart placeholder]
          </div>
        </div>
      </div>
    </section>

    <!-- Problem -->
    <section id="problem" class="bg-white border-y border-slate-100">
      <div class="max-w-7xl mx-auto px-6 py-20">
        <h2 class="text-3xl font-bold text-slate-900">The Problem</h2>
        <div class="mt-8 grid md:grid-cols-3 gap-6">
          @for (p of problems; track p.title) {
            <div class="card">
              <div class="text-lg font-semibold text-slate-900">{{ p.title }}</div>
              <p class="mt-2 text-slate-600 text-sm">{{ p.body }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Solution -->
    <section id="solution" class="bg-leaf-50/50">
      <div class="max-w-7xl mx-auto px-6 py-20">
        <h2 class="text-3xl font-bold text-slate-900">Our Solution</h2>
        <p class="mt-3 text-slate-600 max-w-3xl">
          AgriIntel-X fuses soil, weather, crop management, disease, market price and cost data into a
          single explainable AI decision-support platform that estimates yield, risk, and profit —
          with clear uncertainty and natural-language explanations.
        </p>
        <div class="mt-8 grid md:grid-cols-4 gap-6">
          @for (f of solutions; track f.title) {
            <div class="card">
              <div class="text-leaf-700 font-bold">{{ f.title }}</div>
              <p class="mt-2 text-sm text-slate-600">{{ f.body }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section id="how" class="bg-white border-y border-slate-100">
      <div class="max-w-7xl mx-auto px-6 py-20">
        <h2 class="text-3xl font-bold text-slate-900">How It Works</h2>
        <div class="mt-8 grid md:grid-cols-4 gap-6">
          @for (s of steps; track s.n) {
            <div class="card">
              <div class="w-10 h-10 rounded-full bg-leaf-600 text-white grid place-items-center font-bold">{{ s.n }}</div>
              <div class="mt-3 font-semibold text-slate-900">{{ s.title }}</div>
              <p class="mt-1 text-sm text-slate-600">{{ s.body }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="bg-slate-50">
      <div class="max-w-7xl mx-auto px-6 py-20">
        <h2 class="text-3xl font-bold text-slate-900">Features</h2>
        <div class="mt-8 grid md:grid-cols-3 gap-6">
          @for (f of features; track f.title) {
            <div class="card">
              <div class="text-lg font-semibold text-slate-900">{{ f.title }}</div>
              <p class="mt-2 text-sm text-slate-600">{{ f.body }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Research -->
    <section id="research" class="bg-white border-t border-slate-100">
      <div class="max-w-7xl mx-auto px-6 py-20">
        <h2 class="text-3xl font-bold text-slate-900">Research</h2>
        <p class="mt-3 text-slate-600 max-w-3xl">
          AgriIntel-X is designed as a research platform for multimodal agricultural AI, uncertainty-aware
          prediction, explainable AI, and profit-aware crop decision support.
        </p>
        <div class="mt-8 grid md:grid-cols-5 gap-4">
          @for (rq of researchQuestions; track rq.id) {
            <div class="card">
              <div class="text-xs font-semibold text-leaf-700">{{ rq.id }}</div>
              <p class="mt-2 text-sm text-slate-700">{{ rq.q }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <footer class="bg-slate-900 text-slate-300">
      <div class="max-w-7xl mx-auto px-6 py-10 text-sm">
        <div class="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <div class="font-bold text-white">AgriIntel-X</div>
            <div class="mt-1 text-slate-400">Explainable Multimodal AI Platform for Soil-Aware Crop Yield, Risk and Farmer Profit Forecasting.</div>
          </div>
          <div class="text-slate-400 max-w-md">
            AI-generated agricultural recommendations are decision-support tools and should be validated
            with qualified agricultural experts / local extension services.
          </div>
        </div>
      </div>
    </footer>
  </div>
  `
})
export class LandingComponent {
  problems = [
    { title: 'Fragmented data', body: 'Soil, weather, crop, cost and market data live in different systems — if captured at all.' },
    { title: 'Low trust in AI', body: 'Farmers need transparent, explainable predictions — not black-box numbers.' },
    { title: 'Profit blind spots', body: 'Most tools estimate yield but not profit, risk and uncertainty together.' },
  ];
  solutions = [
    { title: 'Multimodal Fusion', body: 'Soil + weather + management + market + cost in one pipeline.' },
    { title: 'Explainable AI', body: 'Feature attributions and natural-language explanations.' },
    { title: 'Uncertainty-aware', body: 'Prediction intervals and confidence on every forecast.' },
    { title: 'Profit-focused', body: 'Yield, cost, revenue, ROI, break-even, and risk per scenario.' },
  ];
  steps = [
    { n: 1, title: 'Capture', body: 'Record farm, plot, soil, weather and management data.' },
    { n: 2, title: 'Analyse', body: 'AI models estimate yield, risk, and profit.' },
    { n: 3, title: 'Explain', body: 'SHAP-style attributions explain the prediction.' },
    { n: 4, title: 'Decide', body: 'Run What-If scenarios and pick the best plan.' },
  ];
  features = [
    { title: 'Soil Health', body: 'pH, N-P-K, OC, EC, moisture, micronutrients with scoring.' },
    { title: 'Weather Intelligence', body: '7-day forecast, rainfall anomaly and agronomic alerts.' },
    { title: 'Crop Recommendation', body: 'Candidates ranked by suitability, cost and profit.' },
    { title: 'Yield Forecast', body: 'Prediction with lower/upper bounds and confidence.' },
    { title: 'Disease Detection', body: 'Image-based leaf diagnosis with clear demo/real labelling.' },
    { title: 'Risk Intelligence', body: 'Weather, soil, disease, yield, market and input cost risk.' },
    { title: 'What-If Simulator', body: 'Interactive sliders for price, rainfall, cost and disease.' },
    { title: 'Cost & Profit', body: 'ROI, break-even price and yield from real formulas.' },
    { title: 'Reports', body: 'Downloadable PDF reports for farm and soil.' },
    { title: 'Explainability', body: 'Feature importance and natural-language explanations.' },
    { title: 'Research Dashboard', body: 'Model comparison, ablation study and metrics.' },
  ];
  researchQuestions = [
    { id: 'RQ1', q: 'Can multimodal agricultural data improve crop yield forecasting versus conventional ML?' },
    { id: 'RQ2', q: 'Can uncertainty-aware prediction improve decision support reliability?' },
    { id: 'RQ3', q: 'Can combining yield, cost, and market data improve farmer profit estimates?' },
    { id: 'RQ4', q: 'Can explainable AI improve trust in agricultural recommendations?' },
    { id: 'RQ5', q: 'How well does the framework generalise across seasons, locations and crops?' },
  ];
}
