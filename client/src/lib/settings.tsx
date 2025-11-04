import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type SettingsState = {
  rtl: boolean;
  compact: boolean;
  contrast: boolean;
  setRtl: (v: boolean) => void;
  setCompact: (v: boolean) => void;
  setContrast: (v: boolean) => void;
};

const SettingsContext = createContext<SettingsState | undefined>(undefined);

function readBool(key: string, fallback = false): boolean {
  try {
    const v = localStorage.getItem(key);
    return v === "1" ? true : v === "0" ? false : fallback;
  } catch {
    return fallback;
  }
}

function writeBool(key: string, v: boolean) {
  try {
    localStorage.setItem(key, v ? "1" : "0");
  } catch {}
}

function applyDocumentSideEffects({ rtl, compact, contrast }: { rtl: boolean; compact: boolean; contrast: boolean; }) {
  const root = document.documentElement;
  root.dir = rtl ? "rtl" : "ltr";
  root.classList.toggle("rtl", rtl);
  root.classList.toggle("compact", compact);
  root.classList.toggle("contrast", contrast);
}

export const SettingsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [rtl, setRtl] = useState<boolean>(() => readBool("settings-rtl", false));
  const [compact, setCompact] = useState<boolean>(() => readBool("settings-compact", false));
  const [contrast, setContrast] = useState<boolean>(() => readBool("settings-contrast", false));

  useEffect(() => {
    applyDocumentSideEffects({ rtl, compact, contrast });
    writeBool("settings-rtl", rtl);
    writeBool("settings-compact", compact);
    writeBool("settings-contrast", contrast);
  }, [rtl, compact, contrast]);

  const value = useMemo<SettingsState>(
    () => ({ rtl, compact, contrast, setRtl, setCompact, setContrast }),
    [rtl, compact, contrast]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export function useSettings(): SettingsState {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}


