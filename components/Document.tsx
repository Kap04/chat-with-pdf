"use client"

import { useCallback } from 'react';
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import byteSize from "byte-size"

function Document({
  id, name, size, downloadUrl
}: {
  id: string;
  name: string;
  size: number;
  downloadUrl: string
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const href = `/dashboard/files/${id}`;

  return (
    <Link href={href} passHref>
      <div className="flex flex-col w-64 h-80 rounded-xl bg-white drop-shadow-md justify-between p-4 transition-all tranform hover:scale-105 hover:bg-indigo-600 hover:text-white cursor-pointer group">
        <div className="flex-1">
          <div>
            <p className="font-semibold line-clamp-2">{name}</p>
            <p className="text-sm text-gray-500 group-hover:text-indigo-100">
              {byteSize(size).value}
            </p>
          </div>   
        </div>
      </div>
    </Link>
  )
}

export default Document