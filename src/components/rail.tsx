/**
 * Right-rail primitives.
 *
 * Every page's rail is built from the same two pieces — a titled card and a
 * key/value row — so metadata sits in an identical place and reads at an
 * identical weight whether you're on the dashboard, a lesson or the saved
 * list. No client hooks here: these are plain markup, usable from both server
 * and client components.
 */

export function RailCard({
  title,
  action,
  children,
  className = '',
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rail-card ${className}`}>
      {title && (
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <h2 className="rail-card-title">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="meta-row">
      <span className="meta-key">{label}</span>
      <span className="meta-val">{children}</span>
    </div>
  );
}
