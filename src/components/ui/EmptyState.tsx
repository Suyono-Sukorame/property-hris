import React from 'react';

interface EmptyStateProps {
  message?: string;
  colSpan?: number;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'Tidak ada data yang sesuai.',
  colSpan = 1,
}) => (
  <tr>
    <td
      colSpan={colSpan}
      className="px-4 py-12 text-center text-slate-400 text-xs"
    >
      {message}
    </td>
  </tr>
);
