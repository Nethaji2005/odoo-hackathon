export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
        <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <p className="text-red-400 font-medium">{message || "Something went wrong"}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 underline"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
