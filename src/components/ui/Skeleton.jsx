import React from 'react';

/**
 * Base skeleton block — use Tailwind width/height classes on className.
 */
export function Skeleton({ className = '', ...rest }) {
  return <div className={`animate-pulse rounded-md bg-slate-200/90 ${className}`} {...rest} />;
}

/**
 * Generic table body: N rows × M columns of skeleton cells.
 */
export function TableRowsSkeleton({
  rows = 6,
  columns = 8,
  tdClassName = 'px-4 py-3',
  trClassName = '',
  barClassName = ''
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className={trClassName}>
          {Array.from({ length: columns }).map((_, c) => (
            <td key={c} className={tdClassName}>
              <Skeleton
                className={`h-4 ${c % 3 === 0 ? 'w-[90%]' : c % 3 === 1 ? 'w-[70%]' : 'w-[55%]'} ${barClassName}`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default Skeleton;
