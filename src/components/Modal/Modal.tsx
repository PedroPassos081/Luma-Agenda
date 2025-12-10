"use client";

import { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
        {children}

        <button
          onClick={onClose}
          className="mt-4 w-full text-sm text-slate-600 hover:text-slate-900"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
