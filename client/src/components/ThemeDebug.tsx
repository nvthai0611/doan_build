import { useTheme } from "../lib/theme";
import { useEffect } from "react";

const ThemeDebug = () => {
  const { mode, toggle } = useTheme();

  useEffect(() => {
    console.log('ThemeDebug - Current mode:', mode);
    console.log('ThemeDebug - Document classes:', document.documentElement.classList.toString());
  }, [mode]);

  return (
    <div className="fixed top-4 right-4 z-50 p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
      <div className="text-sm">
        <div>Theme Mode: <span className="font-bold">{mode}</span></div>
        <div>Has 'dark' class: <span className="font-bold">{document.documentElement.classList.contains('dark') ? 'Yes' : 'No'}</span></div>
        <button 
          onClick={toggle}
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Toggle Theme
        </button>
      </div>
    </div>
  );
};

export default ThemeDebug;
