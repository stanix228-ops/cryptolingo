// Telegram WebApp SDK helper

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
            language_code?: string;
          };
          start_param?: string;
        };
        colorScheme: 'light' | 'dark';
        themeParams: Record<string, string>;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        expand: () => void;
        close: () => void;
        ready: () => void;
        openLink?: (url: string) => void;
        openTelegramLink?: (url: string) => void;
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
        };
      };
    };
  }
}

export const getTelegramWebApp = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
};

export const initTelegramApp = () => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.ready();
    tg.expand();
    try {
      tg.setHeaderColor('#000000');
      tg.setBackgroundColor('#000000');
    } catch {
      // Ignored if older client
    }
  }
};

export const openTelegramLink = (url: string) => {
  const tg = getTelegramWebApp();
  if (tg && typeof tg.openTelegramLink === 'function') {
    tg.openTelegramLink(url);
  } else {
    window.open(url, '_blank');
  }
};

export const shareToTelegram = (url: string, text: string) => {
  // Use Telegram share protocol: https://t.me/share/url?url=...&text=...
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  openTelegramLink(shareUrl);
};

export const copyText = async (text: string): Promise<boolean> => {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    console.warn('Clipboard writeText failed, falling back', e);
  }

  // Fallback for older webviews
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback copy failed', err);
    return false;
  }
};

export const haptic = {
  light: () => getTelegramWebApp()?.HapticFeedback?.impactOccurred('light'),
  medium: () => getTelegramWebApp()?.HapticFeedback?.impactOccurred('medium'),
  heavy: () => getTelegramWebApp()?.HapticFeedback?.impactOccurred('heavy'),
  success: () => getTelegramWebApp()?.HapticFeedback?.notificationOccurred('success'),
  error: () => getTelegramWebApp()?.HapticFeedback?.notificationOccurred('error'),
  warning: () => getTelegramWebApp()?.HapticFeedback?.notificationOccurred('warning'),
  selection: () => getTelegramWebApp()?.HapticFeedback?.selectionChanged(),
};

export const getTelegramUser = () => {
  const tg = getTelegramWebApp();
  return tg?.initDataUnsafe?.user || {
    id: 123456789,
    first_name: 'Трейдер',
    username: 'crypto_trader',
  };
};
