import { useState } from "react";

const DOC_TYPES = ["id_proof", "address_proof", "educational", "experience", "contract", "other"];

function DocumentRow({ doc }) {
  const typeLabel = doc.type?.replace("_", " ") ?? "—";
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{doc.name}</p>
        <p className="text-xs text-slate-400 mt-0.5 capitalize">{typeLabel}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500">
          {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : "—"}
        </span>
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
        >
          View ↗
        </a>
      </div>
    </div>
  );
}

/**
 * DocumentsSection — Lists employee documents.
 * Admin can add new document metadata entries.
 *
 * NOTE: Actual file upload integration is a future task.
 * Currently supports adding document metadata (name, type, URL).
 */
export default function DocumentsSection({ documents = [], isAdmin, onAddDocument }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", type: "id_proof", url: "" });
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!form.name.trim() || !form.url.trim()) {
      setError("Name and URL are required");
      return;
    }
    try {
      new URL(form.url); // validate URL
    } catch {
      setError("Please enter a valid URL");
      return;
    }
    onAddDocument?.({ ...form, uploadDate: new Date().toISOString() });
    setForm({ name: "", type: "id_proof", url: "" });
    setShowForm(false);
    setError("");
  };

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Documents</h2>
        {isAdmin && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-secondary text-xs"
          >
            + Add Document
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-slate-800/70 rounded-lg p-4 space-y-3 border border-slate-600">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="form-label">Document Name</label>
              <input
                className="form-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Aadhar Card"
              />
            </div>
            <div>
              <label className="form-label">Type</label>
              <select
                className="form-input"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {DOC_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Document URL</label>
              <input
                className="form-input"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleAdd} className="btn-primary text-xs">Add</button>
            <button onClick={() => { setShowForm(false); setError(""); }} className="btn-secondary text-xs">Cancel</button>
          </div>
        </div>
      )}

      {/* Document list */}
      {documents.length === 0 ? (
        <p className="text-sm text-slate-500 py-4 text-center">No documents added yet</p>
      ) : (
        <div>
          {documents.map((doc, idx) => <DocumentRow key={doc._id ?? idx} doc={doc} />)}
        </div>
      )}
    </div>
  );
}
