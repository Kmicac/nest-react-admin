import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Filter } from 'react-feather';

export interface FilterDropdownOption {
  label: string;
  value: string;
}

export interface FilterDropdownSection {
  id: string;
  label: string;
  selectedValue: string;
  options: FilterDropdownOption[];
  onSelect: (value: string) => void;
}

interface FilterDropdownProps {
  sections: FilterDropdownSection[];
  buttonLabel?: string;
}

export default function FilterDropdown({
  sections,
  buttonLabel = 'Filter',
}: FilterDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const activeSection = useMemo(
    () => sections.find((section) => section.id === activeSectionId),
    [sections, activeSectionId],
  );

  const updateMenuPosition = () => {
    if (!buttonRef.current) {
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 8,
      left: rect.left,
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !containerRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setIsOpen(false);
        setActiveSectionId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    updateMenuPosition();

    const handleViewportChange = () => updateMenuPosition();
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        ref={buttonRef}
        className="btn flex items-center gap-2"
        onClick={() => {
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);

          if (nextOpen) {
            updateMenuPosition();
          }

          if (!nextOpen) {
            setActiveSectionId(null);
          }
        }}
      >
        <Filter size={16} /> {buttonLabel}
      </button>

      {isOpen
        ? createPortal(
            <div
              ref={panelRef}
              className="fixed z-[9999] w-72 rounded-md border bg-white shadow-lg p-2"
              style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
            >
              {activeSection ? (
                <>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-left"
                    onClick={() => setActiveSectionId(null)}
                  >
                    <ChevronLeft size={16} />
                    <span className="font-semibold">{activeSection.label}</span>
                  </button>

                  <div className="mt-1 flex flex-col gap-1">
                    {activeSection.options.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-left"
                        onClick={() => activeSection.onSelect(option.value)}
                      >
                        <input
                          type="checkbox"
                          checked={activeSection.selectedValue === option.value}
                          readOnly
                        />
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 text-left"
                      onClick={() => setActiveSectionId(section.id)}
                    >
                      <span>{section.label}</span>
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>
              )}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
