/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { TopBar } from './components/TopBar';
import { HeroSection } from './components/HeroSection';
import { LeakSimulator } from './components/LeakSimulator';
import { ArchitectureSection } from './components/ArchitectureSection';
import { BomAndImpactSection } from './components/BomAndImpactSection';
import { PitchKitSection } from './components/PitchKitSection';
import { Footer } from './components/Footer';

export default function App() {
  const [testTriggerCount, setTestTriggerCount] = useState<number>(0);

  const scrollToSimulator = (triggerLeak: boolean) => {
    if (triggerLeak) {
      setTestTriggerCount((c) => c + 1);
    }
    const target = document.getElementById('simulator');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopBar onRunLeakTest={() => scrollToSimulator(true)} />
      <main className="flex-1">
        <HeroSection onLaunchSimulator={() => scrollToSimulator(false)} />
        <LeakSimulator externalTestTrigger={testTriggerCount} />
        <ArchitectureSection />
        <BomAndImpactSection />
        <PitchKitSection />
      </main>
      <Footer />
    </div>
  );
}
