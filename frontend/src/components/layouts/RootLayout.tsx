/**
 * A global theme component
 * the look and feel of the app are derived from this component
 */

import { ReactNode } from 'react';
import Header from './Header';
import { SidebarProvider, SidebarTrigger } from '../ui/sidebar';
import SidebarComponent from '../features/Sidebar/SidebarComponent';


type RootLayoutProps = {
  children: ReactNode;
};
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <SidebarProvider>
      <SidebarComponent/>
      <div className="p-8 min-h-screen z-10 w-full relative overflow-hidden bg-void-900">
        <SidebarTrigger/>
        <Header text='LINKED' speed={70}/>
        {children}
      </div>
    </SidebarProvider>
  );
}