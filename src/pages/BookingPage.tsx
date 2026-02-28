import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import ResortForm from '@/src/components/forms/ResortForm';
import TurfForm from '@/src/components/forms/TurfForm';
import EventForm from '@/src/components/forms/EventForm';

type TabType = 'resort' | 'turf' | 'event';

export default function BookingPage() {
  const [activeTab, setActiveTab] = useState<TabType>('resort');

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white py-6 px-4 shadow-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-3xl font-serif font-bold tracking-wide mb-1">Little Mangalore</h1>
          <p className="text-primary-light text-sm font-medium tracking-widest uppercase">Resort & Turf</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-surface rounded-2xl shadow-sm border border-primary/5 overflow-hidden">
          
          {/* Tabs */}
          <div className="flex p-2 bg-primary/5">
            {(['resort', 'turf', 'event'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all relative z-10 capitalize",
                  activeTab === tab ? "text-primary" : "text-text-muted hover:text-primary"
                )}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-surface rounded-xl shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    style={{ zIndex: -1 }}
                  />
                )}
                {tab}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'resort' && <ResortForm />}
                {activeTab === 'turf' && <TurfForm />}
                {activeTab === 'event' && <EventForm />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white py-8 px-4 mt-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="font-serif text-xl mb-2">Little Mangalore</h3>
          <p className="text-white/70 text-sm">Kallapu, Thokottu, Karnataka 575017</p>
          <p className="text-white/50 text-xs mt-4">© {new Date().getFullYear()} Little Mangalore. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
