"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CloudSun,
  Heart,
  History,
  LocateFixed,
  MapPinned,
  Settings,
  X,
} from "lucide-react";
import type { RecentSearch, SavedCity } from "@/types/weather";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: CloudSun },
  { key: "saved", label: "Saved Cities", icon: Heart },
  { key: "recent", label: "Recent Searches", icon: History },
  { key: "current", label: "Current Location", icon: LocateFixed },
  { key: "settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  activeView: string;
  onSelectView: (view: string) => void;
  savedCities: SavedCity[];
  recentSearches: RecentSearch[];
  onSelectCity: (city: SavedCity) => void;
  onSelectRecent: (city: string) => void;
}

export function Sidebar({
  open,
  onClose,
  activeView,
  onSelectView,
  savedCities,
  recentSearches,
  onSelectCity,
  onSelectRecent,
}: SidebarProps) {
  return (
    <AnimatePresence>
      {open ? (
        <>
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          aria-label="Close navigation drawer"
        />
        <motion.aside
          initial={{ x: -18, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -18, opacity: 0 }}
          className="fixed inset-y-0 left-0 z-50 flex w-[min(86vw,20rem)] flex-col overflow-y-auto border-r border-white/10 bg-slate-950/90 p-4 text-white shadow-2xl backdrop-blur-xl lg:hidden"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">Orbit</p>
              <h2 className="mt-1 text-lg font-semibold">Navigation</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 p-2 text-slate-200"
              aria-label="Close navigation drawer"
            >
              <X size={16} />
            </button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeView === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    onSelectView(item.key);
                    onClose();
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${active ? "bg-white/12 text-white" : "text-slate-300 hover:bg-white/6"}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 space-y-5">
            <section>
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-slate-400">Saved cities</p>
              <div className="space-y-2">
                {savedCities.length === 0 ? (
                  <p className="text-sm text-slate-400">No saved cities yet.</p>
                ) : (
                  savedCities.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => onSelectCity(city)}
                      className="flex w-full items-center justify-between rounded-2xl bg-white/5 px-3 py-2 text-sm"
                    >
                      <span>{city.name}</span>
                      <MapPinned size={16} className="text-cyan-300" />
                    </button>
                  ))
                )}
              </div>
            </section>

            <section>
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-slate-400">Recent searches</p>
              <div className="space-y-2">
                {recentSearches.length === 0 ? (
                  <p className="text-sm text-slate-400">Your recent searches will appear here.</p>
                ) : (
                  recentSearches.map((search) => (
                    <button
                      key={search.id}
                      type="button"
                      onClick={() => onSelectRecent(search.city)}
                      className="flex w-full items-center justify-between rounded-2xl bg-white/5 px-3 py-2 text-sm"
                    >
                      <span>{search.city}</span>
                      <span className="text-xs text-slate-400">{search.country}</span>
                    </button>
                  ))
                )}
              </div>
            </section>
          </div>
        </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
