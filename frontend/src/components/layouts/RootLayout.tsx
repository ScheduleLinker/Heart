/**
 * A global theme component
 * the look and feel of the app are derived from this component
 */

import { ReactNode } from 'react';
import Header from './Header';


type RootLayoutProps = {
  children: ReactNode;
};
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    
    <div className="p-8 min-h-screen relative z-10 w-full relative overflow-hidden bg-void-900">
        <Header text='LINKED' speed={70}/>
        {children}
    </div>
  );
}