import React from 'react';
export default function ConfirmDialog({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
    <section className="card confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title">
      <h2 id="dialog-title">{title}</h2><p>{message}</p><div className="modal-actions">
        <button className="btn secondary" onClick={onCancel}>Cancel</button><button className="btn danger" onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </section>
  </div>;
}
