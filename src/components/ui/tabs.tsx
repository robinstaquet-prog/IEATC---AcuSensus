'use client';

import { cn } from '@/lib/utils';
import { createContext, useContext, useState } from 'react';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue>({ activeTab: '', setActiveTab: () => {} });

interface TabsProps {
  defaultTab: string;
  children: React.ReactNode;
  className?: string;
  onChange?: (tab: string) => void;
}

export function Tabs({ defaultTab, children, className, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleSetTab = (id: string) => {
    setActiveTab(id);
    onChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleSetTab }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabList({ children, className }: TabListProps) {
  return (
    <div
      className={cn(
        'flex gap-1 border-b border-slate-200 pb-0',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface TabTriggerProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  colorClass?: string;
}

export function TabTrigger({ id, children, className, colorClass }: TabTriggerProps) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === id;

  return (
    <button
      onClick={() => setActiveTab(id)}
      className={cn(
        'px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors relative',
        'focus-visible:outline-none',
        isActive
          ? cn('text-slate-900 bg-white border border-b-white border-slate-200 -mb-px', colorClass)
          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50',
        className,
      )}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-full" />
      )}
    </button>
  );
}

interface TabPanelProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ id, children, className }: TabPanelProps) {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== id) return null;
  return <div className={cn('pt-6', className)}>{children}</div>;
}
