"use client";

import { useState } from "react";
import { SourceReferenceModal, type SourceReferenceDetails } from "./SourceReferenceModal";

interface SourceReferenceLinkProps {
  details: SourceReferenceDetails;
  label?: string;
  className?: string;
}

export function SourceReferenceLink({ details, label, className }: SourceReferenceLinkProps) {
  const [isOpen, setIsOpen] = useState(false);

  const displayLabel = label ?? details.title;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className={className ?? "text-sky-400 hover:underline font-medium cursor-pointer inline-flex items-center gap-1 text-xs"}
      >
        <span>{displayLabel}</span>
        <span className="text-[10px] font-mono">↗</span>
      </button>

      {isOpen && (
        <SourceReferenceModal
          details={details}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
