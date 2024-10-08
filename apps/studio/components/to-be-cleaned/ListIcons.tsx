import { Database } from 'lucide-react'

export const vercelIcon = (
  <div className="flex items-center justify-center rounded bg-black p-1">
    <svg
      className="m-auto fill-current text-white"
      width="12px"
      height="12px"
      viewBox="0 0 1155 1000"
    >
      <path d="M577.344 0L1154.69 1000H0L577.344 0Z" />
    </svg>
  </div>
)

export const databaseIcon = (
  <div className="flex items-center justify-center rounded bg-green-500 p-1 [[data-theme*=dark]_&]:text-typography-body-dark ">
    <Database size={12} strokeWidth={2} />
  </div>
)
