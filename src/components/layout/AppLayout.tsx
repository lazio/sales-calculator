interface AppLayoutProps {
  sidebarNav: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  mainContent: React.ReactNode;
}

export default function AppLayout({ sidebarNav, sidebarFooter, mainContent }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex">
        {/* Sidebar - Navigation menu */}
        <aside className="w-64 min-h-screen bg-white shadow-xl border-r border-gray-200 flex-shrink-0">
          <div className="sticky top-0 h-screen flex flex-col">
            {/* Header in Sidebar */}
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">
                Quote Calculator
              </h1>
            </div>

            {/* Navigation Menu */}
            <div className="p-4 flex-1">
              {sidebarNav}
            </div>

            {/* Sidebar Footer - Copy Buttons */}
            {sidebarFooter}
          </div>
        </aside>

        {/* Main Content - Scrollable, full width */}
        <main className="flex-1 min-h-screen overflow-y-auto">
          <div className="p-4 md:p-8">
            {mainContent}
          </div>
        </main>
      </div>
    </div>
  );
}
