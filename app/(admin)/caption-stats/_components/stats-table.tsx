// app/(admin)/caption-stats/_components/stats-table.tsx
"use client";

import { useMemo, useState } from "react";

export type StatRow = {
  caption_id: string;
  content: string;
  flavor: string | null;
  up: number;
  down: number;
  net: number;
  total: number;
  like_count: number;
};

type SortKey = "up" | "down" | "net" | "total" | "like_count";

export function StatsTable({ rows }: { rows: StatRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const diff = a[sortKey] - b[sortKey];
      return dir === "asc" ? diff : -diff;
    });
    return copy;
  }, [rows, sortKey, dir]);

  function toggle(key: SortKey) {
    if (key === sortKey) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDir("desc");
    }
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
        <p className="text-sm text-gray-500">No votes recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Caption</th>
            <th className="px-4 py-3">Flavor</th>
            <SortHeader label="Up" active={sortKey === "up"} dir={dir} onClick={() => toggle("up")} />
            <SortHeader label="Down" active={sortKey === "down"} dir={dir} onClick={() => toggle("down")} />
            <SortHeader label="Net" active={sortKey === "net"} dir={dir} onClick={() => toggle("net")} />
            <SortHeader label="Total" active={sortKey === "total"} dir={dir} onClick={() => toggle("total")} />
            <SortHeader label="Likes" active={sortKey === "like_count"} dir={dir} onClick={() => toggle("like_count")} />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.map((r, i) => (
            <tr key={r.caption_id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-xs tabular-nums text-gray-400">{i + 1}</td>
              <td className="max-w-md px-4 py-3 text-gray-800">
                <p className="line-clamp-2">
                  {r.content || <span className="italic text-gray-400">empty</span>}
                </p>
              </td>
              <td className="px-4 py-3 text-xs text-gray-600">
                {r.flavor ? (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700">{r.flavor}</span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-right font-medium tabular-nums text-green-700">{r.up.toLocaleString()}</td>
              <td className="px-4 py-3 text-right font-medium tabular-nums text-red-600">{r.down.toLocaleString()}</td>
              <td className={`px-4 py-3 text-right font-semibold tabular-nums ${r.net > 0 ? "text-green-700" : r.net < 0 ? "text-red-600" : "text-gray-500"}`}>
                {r.net > 0 ? `+${r.net.toLocaleString()}` : r.net.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-900">{r.total.toLocaleString()}</td>
              <td className="px-4 py-3 text-right tabular-nums text-gray-600">{r.like_count.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SortHeader({ label, active, dir, onClick }: { label: string; active: boolean; dir: "asc" | "desc"; onClick: () => void }) {
  return (
    <th className="px-4 py-3 text-right">
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1 ${active ? "text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
      >
        {label}
        <span className="text-[10px]">{active ? (dir === "asc" ? "▲" : "▼") : "↕"}</span>
      </button>
    </th>
  );
}