import type { ReactElement } from 'react';
import { AppProvider } from '@context/AppContext';
import AppRoutes from '@routes/index';

/** Main App component */
function App(): ReactElement {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;
