import type { ReactNode } from 'react';
import { CloseIcon } from './icons';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
}

export function Modal({ title, onClose, children, footer }: Props) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-card__header">
          <h3>{title}</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div className="modal-card__body">{children}</div>
        <div className="modal-card__footer">{footer}</div>
      </div>
    </div>
  );
}
