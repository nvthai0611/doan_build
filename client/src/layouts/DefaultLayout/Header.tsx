import { useTheme } from "../../lib/theme";
import { useSettings } from "../../lib/settings";
import { useState } from "react";

const Header = () => {
  const { mode, toggle } = useTheme();
  const { rtl, compact, contrast, setRtl, setCompact, setContrast } = useSettings();
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Header</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
              aria-haspopup="menu"
              aria-expanded={open}
            >
              ⚙️ Settings
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-64 rounded-md border bg-background shadow-lg p-3 z-50">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Dark mode</span>
                  <button className="rounded border px-2 py-1 text-xs" onClick={toggle}>{mode === "dark" ? "On" : "Off"}</button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Contrast</span>
                  <button className="rounded border px-2 py-1 text-xs" onClick={() => setContrast(!contrast)}>{contrast ? "On" : "Off"}</button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Right to left</span>
                  <button className="rounded border px-2 py-1 text-xs" onClick={() => setRtl(!rtl)}>{rtl ? "On" : "Off"}</button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Compact</span>
                  <button className="rounded border px-2 py-1 text-xs" onClick={() => setCompact(!compact)}>{compact ? "On" : "Off"}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;


