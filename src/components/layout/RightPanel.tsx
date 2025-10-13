interface RightPanelProps {
  children: React.ReactNode;
}

export default function RightPanel({ children }: RightPanelProps) {
  return (
    <div className="sticky top-8">
      {children}
    </div>
  );
}
