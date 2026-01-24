import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
    children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    const location = useLocation();
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MainLayout.tsx:render',message:'MainLayout renderizando',data:{pathname:location.pathname,hasChildren:!!children},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    return (
        <div className="full-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative" style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden', overscrollBehavior: 'none' }}>
            {/* Background Ambience - Breathing blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-[rgba(41,151,255,0.08)] rounded-full blur-[120px] animate-breathe" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-[rgba(94,92,230,0.08)] rounded-full blur-[120px] animate-breathe" style={{ animationDelay: '4s' }} />
            </div>

            <main className="main-screen h-full w-full pt-[env(safe-area-inset-top)] pb-[calc(var(--tabbar-height)+env(safe-area-inset-bottom))] px-4 sm:px-6 flex flex-col relative z-0" style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden', overscrollBehavior: 'none' }}>
                <div
                    key={location.pathname}
                    className="flex-1 flex flex-col items-center justify-center h-full w-full"
                    style={{ width: '100%', maxWidth: '100%' }}
                >
                    {children}
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
