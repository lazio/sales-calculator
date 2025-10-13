interface AppLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export default function AppLayout({ leftPanel, rightPanel }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Price Quote Calculator
          </h1>
        </header>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left Panel - Configuration */}
          <div className="order-2 lg:order-1">
            {leftPanel}
          </div>

          {/* Right Panel - Quote Summary (Sticky) */}
          <div className="order-1 lg:order-2">
            {rightPanel}
          </div>
        </div>
      </div>
    </div>
  );
}
