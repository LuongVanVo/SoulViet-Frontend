import { RouterProvider } from 'react-router-dom';
import { router } from './routes/index';
import { useInitAuth } from './hooks/useInitAuth';


function App() {
   useInitAuth()
  return <RouterProvider router={router} />;
}

export default App;
