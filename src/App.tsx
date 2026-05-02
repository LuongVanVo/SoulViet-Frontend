import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';
import { useInitAuth } from '@/hooks/useInitAuth';

import { Toaster } from 'react-hot-toast';

function App() {
   useInitAuth();
  return (
    <>
      <Toaster />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
