import { QueryClient } from '@tanstack/react-query';
import PocketBase from 'pocketbase';

export const queryClient = new QueryClient();
export const pb = new PocketBase(import.meta.env.VITE_API_URL);