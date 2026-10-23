import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  candidate,
  onConfirm,
  onCancel,
  isDeleting = false
}) {
  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onCancel();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen || !candidate) return null;

  return (
    <div
      className="delete-modal-backdrop"
      onClick={e => {
        if (!isDeleting && e.target === e.currentTarget) {
          onCancel();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="delete-modal-card">
        {/* Close icon button */}
        <button
          type="button"
          className="delete-modal-close"
          onClick={onCancel}
          disabled={isDeleting}
          aria-label="Close"
          title="Cancel"
        >
          <X size={18} />
        </button>

        {/* Warning Icon Emblem */}
        <div className="delete-modal-icon-badge">
          <Trash2 size={26} strokeWidth={2.2} />
        </div>

        {/* Header & Description */}
        <div className="delete-modal-content">
          <h3 id="delete-modal-title" className="delete-modal-title">
            Delete Candidate Profile?
          </h3>
          <p className="delete-modal-desc">
            Are you sure you want to permanently remove this candidate? This will delete their profile details, AI screening evaluation, and resume records.
          </p>

          {/* Candidate Card Snippet */}
          <div className="delete-modal-candidate-chip">
            <div className="delete-candidate-avatar">
              {candidate.name
                ? candidate.name
                    .split(' ')
                    .map(w => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'CV'}
            </div>
            <div className="delete-candidate-info">
              <span className="delete-candidate-name">{candidate.name || 'Unnamed Candidate'}</span>
              <span className="delete-candidate-meta">
                {candidate.primary_category || 'General'} &bull; {candidate.passout_year ? `${candidate.passout_year} Batch` : 'Candidate'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="delete-modal-actions">
          <button
            type="button"
            className="btn btn-secondary delete-cancel-btn"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn delete-confirm-btn"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 size={15} className="spin-icon" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={15} />
                <span>Delete Candidate</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
