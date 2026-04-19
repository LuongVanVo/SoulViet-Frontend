import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';
import { useInitAuth } from '@/hooks/useInitAuth';
import { useSignalR } from '@/hooks/useSignalR';

function App() {
   useInitAuth();
   useSignalR();
  return <RouterProvider router={router} />;
}

export default App;
