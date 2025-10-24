import { useState, ReactNode } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
}

export default function CollapsibleSection({
  title,
  children,
  defaultExpanded = true,
  isExpanded: controlledIsExpanded,
  onToggle,
}: CollapsibleSectionProps) {
  const [internalIsExpanded, setInternalIsExpanded] = useState(defaultExpanded);

  // Use controlled state if provided, otherwise use internal state
  const isExpanded = controlledIsExpanded !== undefined ? controlledIsExpanded : internalIsExpanded;

  const handleToggle = () => {
    const newValue = !isExpanded;
    if (onToggle) {
      onToggle(newValue);
    } else {
      setInternalIsExpanded(newValue);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <button
        onClick={handleToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <svg
          className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="p-4 max-h-[600px] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
