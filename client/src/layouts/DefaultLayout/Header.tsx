import { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  Search, 
  Wifi, 
  HelpCircle, 
  Bell, 
  Settings, 
  User,
  X,
  ChevronDown,
  LogOut,
  Maximize2,
  RotateCcw,
  Moon,
  Contrast,
  ArrowRight,
  ArrowLeft,
  ArrowUpDown,
  Info,
  Palette
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../assets/shadcn-ui/components/ui/dropdown-menu";
import { Switch } from "../../assets/shadcn-ui/components/ui/switch";
import { Button } from "../../assets/shadcn-ui/components/ui/button";
import { useTheme } from "../../lib/theme";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { alertService } from "../../services/center-owner/alerts/alert.service";
import { AlertList } from "../../components/Alerts/AlertList";
import { useAuth } from "../../lib/auth";

// Notification Dropdown Component
const NotificationDropdown = () => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user } = useAuth();
  
  // Chỉ các role center_owner, admin, teacher mới có quyền xem alerts
  const hasAlertAccess = user?.role === 'center_owner' || user?.role === 'admin' || user?.role === 'teacher';
  
  const { data: unreadCountData, refetch } = useQuery({
    queryKey: ['alerts', 'unread-count'],
    queryFn: async () => {
      try {
        const response = await alertService.getUnreadCount();
        return response.data.count;
      } catch (error) {
        // Không báo lỗi, chỉ return 0
        return 0;
      }
    },
    enabled: hasAlertAccess, // Chỉ gọi API khi có quyền
    refetchInterval: hasAlertAccess ? 30000 : false, // Refetch every 30 seconds nếu có quyền
  });

  const unreadCount = unreadCountData || 0;
  
  // Nếu không có quyền, không hiển thị notification dropdown
  if (!hasAlertAccess) {
    return null;
  }

  return (
    <DropdownMenu
      open={notificationsOpen}
      onOpenChange={setNotificationsOpen}
    >
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <AlertList onUpdate={refetch} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Header = () => {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsFullscreen, setSettingsFullscreen] = useState(false);
  
  // Use theme from ThemeProvider
  const { mode: darkMode, toggle: toggleDarkMode } = useTheme();
  
  // Other settings states
  const [contrast, setContrast] = useState(false);
  const [rightToLeft, setRightToLeft] = useState(false);
  const [compact, setCompact] = useState(false);
  const [navLayout, setNavLayout] = useState("sidebar");
  const [navColor, setNavColor] = useState("integrate");
  const [preset, setPreset] = useState("default");
  const [font, setFont] = useState("inter");
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  // Reset settings to default
  const resetSettings = () => {
    toggleDarkMode(); // Reset to light mode
    setContrast(false);
    setRightToLeft(false);
    setCompact(false);
    setNavLayout("sidebar");
    setNavColor("integrate");
    setPreset("default");
    setFont("inter");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Implement search functionality here
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  // Load settings from localStorage (excluding darkMode which is handled by ThemeProvider)
  useEffect(() => {
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setContrast(settings.contrast || false);
      setRightToLeft(settings.rightToLeft || false);
      setCompact(settings.compact || false);
      setNavLayout(settings.navLayout || "sidebar");
      setNavColor(settings.navColor || "integrate");
      setPreset(settings.preset || "default");
      setFont(settings.font || "inter");
    }
  }, []);

  // Save settings to localStorage (excluding darkMode which is handled by ThemeProvider)
  useEffect(() => {
    const settings = {
      contrast,
      rightToLeft,
      compact,
      navLayout,
      navColor,
      preset,
      font
    };
    localStorage.setItem('app-settings', JSON.stringify(settings));
  }, [contrast, rightToLeft, compact, navLayout, navColor, preset, font]);

  // // Debug: Log theme state
  // useEffect(() => {
  //   console.log('Current theme mode:', darkMode);
  //   console.log('Document classes:', document.documentElement.classList.toString());
  // }, [darkMode]);

  // Apply font changes
  useEffect(() => {
    document.documentElement.style.fontFamily = font === 'inter' ? 'Inter, sans-serif' :
      font === 'roboto' ? 'Roboto, sans-serif' :
      font === 'poppins' ? 'Poppins, sans-serif' :
      'Open Sans, sans-serif';
  }, [font]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        setSettingsOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSettingsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);
  
  return (
    <div className="w-full border-b bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-6">
          {/* CenterUp Demo Section */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                QN Edu System
              </span>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded">
                ADVANCED
              </span>
            </div>
            {/* <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-gray-600">Số dư:</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-yellow-800 font-bold text-xs">N</span>
                </div>
                <span className="text-sm font-medium text-gray-900">761.113</span>
              </div>
            </div> */}
          </div>
        </div>

        {/* Center Section */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full opacity-80"></div>
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Center <span className="text-pink-500">B</span>rain
          </span>
          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-medium rounded">
            beta
          </span>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Network Status */}
          {/* <div className="flex items-center gap-2 text-green-600">
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Mạng tốt</span>
          </div> */}

          {/* Search */}
          {searchOpen ? (
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
            >
              <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tìm kiếm..."
                className="flex-1 outline-none text-sm min-w-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ⌘K
              </span>
            </button>
          )}

          {/* Vietnam Flag */}
          <div className="w-6 h-4 bg-red-500 relative">
            <div className="absolute top-0 left-0 w-2 h-4 bg-yellow-400"></div>
            <div className="absolute top-1 left-1 w-1 h-2 bg-yellow-400"></div>
          </div>

          {/* Help */}
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Notifications */}
          <NotificationDropdown />

          {/* Settings */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            title="Settings (Ctrl+,)"
          >
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 via-purple-500 to-blue-500 p-0.5">
                  <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex items-center gap-2" onClick={() => navigate('/profile')}>
                  <User
                    className="mr-2 h-4 w-4"
                  />
                  Hồ sơ cá nhân
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Cài đặt
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await logout();
                  navigate('/auth');
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Settings Panel */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSettingsOpen(false)}
          />

          {/* Settings Panel */}
          <div
            className={`absolute right-0 top-0 h-full bg-white dark:bg-gray-900 shadow-xl transition-all duration-300 ${
              settingsFullscreen ? 'w-full' : 'w-96'
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Settings
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSettingsFullscreen(!settingsFullscreen)}
                    title={
                      settingsFullscreen ? 'Exit fullscreen' : 'Fullscreen'
                    }
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetSettings}
                    title="Reset to default"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSettingsOpen(false)}
                    title="Close settings"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Theme Options */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        Dark mode
                      </span>
                    </div>
                    <Switch
                      checked={darkMode === 'dark'}
                      onCheckedChange={toggleDarkMode}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-200 to-blue-600 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="font-medium">Contrast</span>
                    </div>
                    <Switch checked={contrast} onCheckedChange={setContrast} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <div className="w-1 h-4 bg-gray-600"></div>
                        <ArrowRight className="w-3 h-3 text-gray-600" />
                      </div>
                      <span className="font-medium">Right to left</span>
                    </div>
                    <Switch
                      checked={rightToLeft}
                      onCheckedChange={setRightToLeft}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <ArrowUpDown className="w-4 h-4 text-gray-600" />
                        <div className="w-1 h-4 bg-gray-300 border-l-2 border-dashed border-gray-400"></div>
                      </div>
                      <span className="font-medium">Compact</span>
                      <Info className="w-4 h-4 text-gray-400" />
                    </div>
                    <Switch checked={compact} onCheckedChange={setCompact} />
                  </div>
                </div>

                {/* Nav Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Nav</h3>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>

                  {/* Layout Options */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Layout
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setNavLayout('sidebar')}
                        className={`p-3 border rounded-lg transition-colors ${
                          navLayout === 'sidebar'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-8 flex">
                          <div className="w-2 h-full bg-blue-500 rounded"></div>
                          <div className="flex-1 ml-2 space-y-1">
                            <div className="h-1 bg-blue-500 rounded"></div>
                            <div className="h-1 bg-blue-500 rounded"></div>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => setNavLayout('top')}
                        className={`p-3 border rounded-lg transition-colors ${
                          navLayout === 'top'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-8 flex flex-col space-y-1">
                          <div className="h-1 bg-gray-400 rounded"></div>
                          <div className="h-1 bg-gray-400 rounded"></div>
                        </div>
                      </button>
                      <button
                        onClick={() => setNavLayout('bottom')}
                        className={`p-3 border rounded-lg transition-colors ${
                          navLayout === 'bottom'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-8 flex flex-col space-y-1">
                          <div className="h-1 bg-gray-400 rounded"></div>
                          <div className="h-1 bg-gray-400 rounded"></div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Color Options */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Color
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setNavColor('integrate')}
                        className={`p-3 border rounded-lg transition-colors ${
                          navColor === 'integrate'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-8 flex">
                          <div className="w-2 h-full bg-blue-500 rounded"></div>
                          <div className="flex-1 ml-2 space-y-1">
                            <div className="h-1 bg-blue-500 rounded"></div>
                            <div className="h-1 bg-blue-500 rounded"></div>
                          </div>
                        </div>
                        <div className="text-xs text-center mt-2">
                          Integrate
                        </div>
                      </button>
                      <button
                        onClick={() => setNavColor('apparent')}
                        className={`p-3 border rounded-lg transition-colors ${
                          navColor === 'apparent'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-8 flex">
                          <div className="w-2 h-full bg-gray-400 rounded"></div>
                          <div className="flex-1 ml-2 space-y-1">
                            <div className="h-1 bg-gray-400 rounded"></div>
                            <div className="h-1 bg-gray-400 rounded"></div>
                          </div>
                        </div>
                        <div className="text-xs text-center mt-2">Apparent</div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Presets Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Presets</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'default', color: 'blue' },
                      { id: 'green', color: 'green' },
                      { id: 'brown', color: 'amber' },
                      { id: 'pink', color: 'pink' },
                      { id: 'purple', color: 'purple' },
                      { id: 'gray', color: 'gray' },
                    ].map((presetOption) => (
                      <button
                        key={presetOption.id}
                        onClick={() => setPreset(presetOption.id)}
                        className={`p-3 border rounded-lg transition-colors ${
                          preset === presetOption.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-8 flex">
                          <div
                            className={`w-2 h-full bg-${presetOption.color}-500 rounded`}
                          ></div>
                          <div className="flex-1 ml-2 space-y-1">
                            <div
                              className={`h-1 bg-${presetOption.color}-500 rounded`}
                            ></div>
                            <div
                              className={`h-1 bg-${presetOption.color}-500 rounded`}
                            ></div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Font</h3>
                  <div className="space-y-2">
                    {[
                      { id: 'inter', name: 'Inter' },
                      { id: 'roboto', name: 'Roboto' },
                      { id: 'poppins', name: 'Poppins' },
                      { id: 'open-sans', name: 'Open Sans' },
                    ].map((fontOption) => (
                      <button
                        key={fontOption.id}
                        onClick={() => setFont(fontOption.id)}
                        className={`w-full p-3 text-left border rounded-lg transition-colors ${
                          font === fontOption.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">{fontOption.name}</div>
                        <div className="text-sm text-gray-500">Aa Bb Cc</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;


