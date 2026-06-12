export default function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M6 1l1.236 2.507L10 3.927l-2 1.949.472 2.752L6 7.25l-2.472 1.378L4 5.876 2 3.927l2.764-.42L6 1z"
            fill={s <= rating ? "#f59e0b" : "#e5e7eb"}
          />
        </svg>
      ))}
    </div>
  );
}
