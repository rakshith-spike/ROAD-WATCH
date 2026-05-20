export function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{eyebrow}</p> : null}
        <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
