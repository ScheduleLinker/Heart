/**
 * A global theme component
 * the look and feel of the app are derived from this component
 */

import { ReactNode } from 'react';
type RootLayoutProps = {
  children: ReactNode;
};
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen relative z-10 w-full relative overflow-hidden bg-void-900">
        {children}
    </div>
  );
}