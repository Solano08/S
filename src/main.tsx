import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'
import App from './App.tsx'

// #region agent log
const log = (location: string, message: string, data: any) => {
  fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location,
      message,
      data,
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1'
    })
  }).catch(() => {});
};
// #endregion

// Ocultar loading screen cuando React cargue
const hideLoading = () => {
  // #region agent log
  log('main.tsx:hideLoading', 'Iniciando ocultar loading', {
    hypothesisId: 'A',
    loadingExists: !!document.getElementById('app-loading')
  });
  // #endregion
  
  requestAnimationFrame(() => {
    const loading = document.getElementById('app-loading');
    // #region agent log
    log('main.tsx:hideLoading:raf', 'Dentro de requestAnimationFrame', {
      hypothesisId: 'A',
      loadingFound: !!loading,
      loadingOpacity: loading?.style.opacity,
      loadingDisplay: loading?.style.display
    });
    // #endregion
    
    if (loading) {
      loading.style.opacity = '0';
      // #region agent log
      log('main.tsx:hideLoading:setOpacity', 'Opacity establecido a 0', {
        hypothesisId: 'A',
        computedOpacity: window.getComputedStyle(loading).opacity
      });
      // #endregion
      
      setTimeout(() => {
        // #region agent log
        log('main.tsx:hideLoading:remove', 'Intentando remover loading', {
          hypothesisId: 'A',
          hasParent: !!loading.parentNode
        });
        // #endregion
        
        if (loading.parentNode) {
          loading.parentNode.removeChild(loading);
          // #region agent log
          log('main.tsx:hideLoading:removed', 'Loading removido exitosamente', {
            hypothesisId: 'A'
          });
          // #endregion
        }
      }, 300);
    }
  });
};

// #region agent log
log('main.tsx:init', 'Iniciando main.tsx', {
  hypothesisId: 'B',
  rootExists: !!document.getElementById('root'),
  loadingExists: !!document.getElementById('app-loading')
});
// #endregion

// Renderizar inmediatamente - no esperar nada
const rootElement = document.getElementById('root');

// #region agent log
log('main.tsx:rootElement', 'Root element obtenido', {
  hypothesisId: 'B',
  rootExists: !!rootElement,
  rootDimensions: rootElement ? {
    width: rootElement.offsetWidth,
    height: rootElement.offsetHeight,
    display: window.getComputedStyle(rootElement).display,
    visibility: window.getComputedStyle(rootElement).visibility,
    opacity: window.getComputedStyle(rootElement).opacity
  } : null
});
// #endregion

if (!rootElement) {
  // #region agent log
  log('main.tsx:error', 'ERROR: Root element no encontrado', {
    hypothesisId: 'B',
    error: 'Root element not found'
  });
  // #endregion
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

// #region agent log
log('main.tsx:beforeRender', 'Antes de renderizar React', {
  hypothesisId: 'B',
  rootCreated: !!root
});
// #endregion

try {
  root.render(
    <StrictMode>
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </StrictMode>
  );
  
  // #region agent log
  log('main.tsx:afterRender', 'React renderizado exitosamente', {
    hypothesisId: 'B',
    rootContent: rootElement.innerHTML.substring(0, 200)
  });
  // #endregion
} catch (error) {
  // #region agent log
  log('main.tsx:renderError', 'ERROR al renderizar React', {
    hypothesisId: 'B',
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  });
  // #endregion
  throw error;
}

// Ocultar loading después de que React renderice (muy rápido)
setTimeout(() => {
  // #region agent log
  log('main.tsx:timeout', 'Timeout para ocultar loading', {
    hypothesisId: 'A',
    loadingStillExists: !!document.getElementById('app-loading')
  });
  // #endregion
  hideLoading();
}, 50);
