export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display text-2xl leading-none ${className}`}>
      Pay<span className="font-display-italic">Rank</span>
    </span>
  );
}
