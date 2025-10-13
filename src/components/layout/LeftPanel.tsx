interface LeftPanelProps {
  children: React.ReactNode;
}

export default function LeftPanel({ children }: LeftPanelProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
      {children}
    </div>
  );
}
