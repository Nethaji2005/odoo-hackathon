/**
 * ProfileHeader — displays employee avatar, name, title, ID, and status badge.
 * Allows profile picture change when isEditable is true.
 */
export default function ProfileHeader({ employee, isEditable, onPictureChange }) {
  const initials = `${employee.firstName?.[0] ?? ""}${employee.lastName?.[0] ?? ""}`.toUpperCase();

  const statusClass = {
    active: "badge-active",
    inactive: "badge-inactive",
    on_leave: "badge-on_leave",
    terminated: "badge-terminated",
  }[employee.status] ?? "badge-inactive";

  return (
    <div className="card flex flex-col sm:flex-row items-center sm:items-start gap-5">
      {/* Avatar */}
      <div className="relative shrink-0">
        {employee.profilePicture ? (
          <img
            src={employee.profilePicture}
            alt={employee.fullName}
            className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-indigo-500">
            {initials}
          </div>
        )}

        {isEditable && (
          <label
            htmlFor="profile-pic-upload"
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-500 transition-colors"
            title="Change profile picture"
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-1.414a2 2 0 01.586-1.414z" />
            </svg>
            <input
              id="profile-pic-upload"
              type="text"
              className="hidden"
              placeholder="Paste image URL"
              onChange={(e) => onPictureChange?.(e.target.value)}
            />
          </label>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 text-center sm:text-left">
        <h1 className="text-2xl font-bold text-white">
          {employee.firstName} {employee.lastName}
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          {employee.jobTitle || "—"} · {employee.department || "—"}
        </p>
        <p className="text-slate-500 text-xs mt-1">ID: {employee.employeeId}</p>

        <div className="mt-3 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
          <span className={`badge ${statusClass}`}>{employee.status?.replace("_", " ") ?? "—"}</span>
          <span className="badge" style={{ background: "#1e293b", color: "#94a3b8" }}>
            {employee.employmentType?.replace("_", " ") ?? "—"}
          </span>
          {employee.workLocation && (
            <span className="badge" style={{ background: "#1e293b", color: "#94a3b8" }}>
              📍 {employee.workLocation}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
