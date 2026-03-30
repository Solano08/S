import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
    children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    const location = useLocation();

    return (
        <div className="full-screen" style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden', overscrollBehavior: 'none' }}>
            {/* Ambiente de fondo (blobs); stacking con inline: no hay utilidades Tailwind en el proyecto */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                    pointerEvents: 'none',
                    overflow: 'hidden',
                }}
            >
                <div
                    className="animate-breathe"
                    style={{
                        position: 'absolute',
                        top: '-10%',
                        left: '-10%',
                        width: '80%',
                        height: '80%',
                        background: 'rgba(41,151,255,0.08)',
                        borderRadius: '50%',
                        filter: 'blur(120px)',
                        pointerEvents: 'none',
                    }}
                />
                <div
                    className="animate-breathe"
                    style={{
                        position: 'absolute',
                        bottom: '-10%',
                        right: '-10%',
                        width: '80%',
                        height: '80%',
                        background: 'rgba(94,92,230,0.08)',
                        borderRadius: '50%',
                        filter: 'blur(120px)',
                        pointerEvents: 'none',
                        animationDelay: '4s',
                    }}
                />
            </div>

            <main
                className="main-screen h-full w-full pt-[env(safe-area-inset-top)] pb-[calc(var(--tabbar-height)+env(safe-area-inset-bottom))] px-4 sm:px-6 flex flex-col"
                style={{
                    minHeight: '100vh',
                    width: '100%',
                    overflowX: 'hidden',
                    overscrollBehavior: 'none',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
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
