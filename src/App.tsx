import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App
