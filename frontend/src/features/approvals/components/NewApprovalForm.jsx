import { useState } from 'react';
import { createApproval } from '../api/approvalApi';

const REQUIRED_LEVELS = ['NONE', 'SALES_MANAGER', 'FINANCE'];

const INITIAL = {
  quotationId: '',
  riskScore: '',
  requiredLevel: 'SALES_MANAGER',
  requestedBy: '',
};

/**
 * NewApprovalForm — controlled form for submitting a new approval request.
 *
 * @param {{ onSuccess: (approval: Object) => void, onCancel: () => void }} props
 */
export default function NewApprovalForm({ onSuccess, onCancel }) {
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) =>
    setValues((prev) => ({ ...prev, [field]: e.target.value }));

  function validate() {
    const errs = {};
    if (!values.quotationId.trim()) errs.quotationId = 'Quotation ID is required';
    const score = parseFloat(values.riskScore);
    if (values.riskScore === '') errs.riskScore = 'Risk score is required';
    else if (isNaN(score) || score < 0 || score > 100)
      errs.riskScore = 'Must be 0–100';
    if (!values.requiredLevel) errs.requiredLevel = 'Required level is required';
    if (!values.requestedBy.trim()) errs.requestedBy = 'Requester ID is required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError(null);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const res = await createApproval({
        ...values,
        riskScore: parseFloat(values.riskScore),
      });
      onSuccess(res.data);
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'Failed to create approval';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {apiError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-800 bg-red-900/30 p-4 text-sm text-red-300">
          <span className="shrink-0">⚠</span>
          {apiError}
        </div>
      )}

      {/* Quotation ID */}
      <Field label="Quotation ID" required error={errors.quotationId}>
        <input
          id="naf-quotationId"
          type="text"
          value={values.quotationId}
          onChange={set('quotationId')}
          placeholder="e.g. QUO-2024-001"
          className={inputCls(errors.quotationId)}
        />
      </Field>

      {/* Risk Score */}
      <Field label="Risk Score (0–100)" required error={errors.riskScore}>
        <input
          id="naf-riskScore"
          type="number"
          min="0" max="100" step="0.1"
          value={values.riskScore}
          onChange={set('riskScore')}
          placeholder="e.g. 65"
          className={inputCls(errors.riskScore)}
        />
      </Field>

      {/* Required Level */}
      <Field label="Required Approval Level" required error={errors.requiredLevel}>
        <select
          id="naf-requiredLevel"
          value={values.requiredLevel}
          onChange={set('requiredLevel')}
          className={inputCls(errors.requiredLevel)}
        >
          {REQUIRED_LEVELS.map((l) => (
            <option key={l} value={l}>{l.replace('_', ' ')}</option>
          ))}
        </select>
      </Field>

      {/* Requested By */}
      <Field label="Requested By (User ID)" required error={errors.requestedBy}>
        <input
          id="naf-requestedBy"
          type="text"
          value={values.requestedBy}
          onChange={set('requestedBy')}
          placeholder="User ID or email"
          className={inputCls(errors.requestedBy)}
        />
      </Field>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          id="naf-submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 transition-colors disabled:opacity-50"
        >
          {submitting
            ? <><Spinner /> Submitting…</>
            : 'Submit Approval Request'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function inputCls(error) {
  return `w-full rounded-lg border ${error ? 'border-red-600' : 'border-slate-700'} bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500`;
}

function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />;
}
