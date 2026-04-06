import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function apiFetch(url: string, options: RequestInit = {}) {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  
  const headers: any = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };

  // Convert relative URLs to absolute based on VITE_API_URL
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const targetUrl = url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;

  const response = await fetch(targetUrl, {
    ...options,
    headers
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}
