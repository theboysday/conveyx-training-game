import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-24 flex flex-col items-center text-center gap-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 dark:bg-blue-900/40 px-4 py-1 text-sm font-medium text-blue-700 dark:text-blue-200">
          <Zap className="h-4 w-4" />
          ConveyX Training Suite
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
          Master Mod-LinX troubleshooting with our interactive simulator
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl">
          Step into a realistic operations environment that helps technicians practice diagnosing faults
          across ConveyX Mod-LinX conveyor systems. Launch the training app to explore live scenarios
          and improve your response time.
        </p>
        <Button asChild size="lg" className="group">
          <Link href="/training" className="flex items-center gap-2">
            Launch Training App
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </main>
  );
}
