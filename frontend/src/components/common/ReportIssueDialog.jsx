import React, { useState } from 'react';
import Button from './Button.jsx';

export default function ReportIssueDialog({ open, orderId, onSubmit, onCancel }) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(message.trim());
      setMessage('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onCancel}>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Report an issue</h2>
        <p className="text-sm text-gray-500 mb-4">Order #{orderId}</p>
        <textarea
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-4"
          rows={4}
          placeholder="e.g. My payment was deducted but this order isn't showing."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={1000}
        />
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting || !message.trim()}>
            {submitting ? 'Submitting…' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  );
}