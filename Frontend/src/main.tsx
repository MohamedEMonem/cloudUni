import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from '@/store/store.ts'
import { Notification } from '@/components/ui/Notification.tsx'
import { OwnerStoreProvider } from '@/context/OwnerStoreContext.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <OwnerStoreProvider>
        <App />
      </OwnerStoreProvider>
      <Notification />
    </Provider>
  </StrictMode>,
)
