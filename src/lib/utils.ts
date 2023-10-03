import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const currencyFormatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

export function popupCenter({ url, title, w, h }: { url: string, title: string, w: number, h: number }): Window | null {
  // Fixes dual-screen position                             Most browsers      Firefox
  const dualScreenLeft = typeof window.screenLeft !== 'undefined' ? window.screenLeft : window.screenX;
  const dualScreenTop = typeof window.screenTop !== 'undefined' ? window.screenTop : window.screenY;

  const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
  const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

  const systemZoom = width / window.screen.availWidth;
  const left = ((width - w) / 2) + systemZoom + dualScreenLeft
  const top = ((height - h) / 2) + systemZoom + dualScreenTop
  const newWindow = window.open(url, title,
      `
    scrollbars=yes,
    width=${w},
    height=${h},
    top=${top},
    left=${left}
    `
  )

  newWindow?.focus();
  return newWindow;
}
