// app/(admin)/caption-stats/page.tsx
import { createClient } from "@/lib/supabase/server";
import { StatsTable, type StatRow } from "./_components/stats-table";

export const dynamic = "force-dynamic";

const VOTE_PAGE = 1000;
const MAX_PAGES = 300;
const TABLE_LIMIT = 100;

type Tally = { up: number; down: number; neutral: number; net: number; total: number };

export default async function CaptionStatsPage() {
  const supabase = await createClient();

  // ---- Aggregate every vote (paginated through caption_votes) ----
  const tally = new Map<string, Tally>();
  let totalVotes = 0;
  let up = 0;
  let down = 0;
  let neutral = 0;
  let net = 0;
  let truncated = false;
  let loadError: string | null = null;

  let offset = 0;
  for (let page = 0; page < MAX_PAGES; page++) {
    const { data, error } = await supabase
      .from("caption_votes")
      .select("caption_id, vote_value")
      .range(offset, offset + VOTE_PAGE - 1);

    if (error) {
      loadError = error.message;
      break;
    }
    if (!data || data.length === 0) break;

    for (const v of data) {
      const val = Number(v.vote_value) || 0;
      const cid = v.caption_id as string | null;
      totalVotes++;
      net += val;
      if (val > 0) up++;
      else if (val < 0) down++;
      else neutral++;
      if (!cid) continue;
      let t = tally.get(cid);
      if (!t) {
        t = { up: 0, down: 0, neutral: 0, net: 0, total: 0 };
        tally.set(cid, t);
      }
      t.total++;
      t.net += val;
      if (val > 0) t.up++;
      else if (val < 0) t.down++;
      else t.neutral++;
    }

    if (data.length < VOTE_PAGE) break;
    offset += VOTE_PAGE;
    if (page === MAX_PAGES - 1) truncated = true;
  }

  const captionsRated = tally.size;
  const avgVotes = captionsRated > 0 ? totalVotes / captionsRated : 0;
  const upPct = totalVotes > 0 ? Math.round((up / totalVotes) * 100) : 0;
  const downPct = totalVotes > 0 ? Math.round((down / totalVotes) * 100) : 0;

  // ---- Top N captions by total votes ----
  const ranked = Array.from(tally.entries())
    .map(([caption_id, t]) => ({ caption_id, ...t }))
    .sort((a, b) => b.total - a.total)
    .slice(0, TABLE_LIMIT);

  // ---- Hydrate content + flavor for the displayed captions only ----
  const ids = ranked.map((r) => r.caption_id);
  const contentMap = new Map<string, { content: string | null; humor_flavor_id: number | null; like_count: number }>();
  if (ids.length > 0) {
    const { data: caps } = await supabase
      .from("captions")
      .select("id, content, humor_flavor_id, like_count")
      .in("id", ids);
    (caps ?? []).forEach((c) =>
      contentMap.set(c.id as string, {
        content: c.content,
        humor_flavor_id: c.humor_flavor_id,
        like_count: Number(c.like_count) || 0,
      })
    );
  }

  const flavorIds = Array.from(
    new Set(
      Array.from(contentMap.values())
        .map((c) => c.humor_flavor_id)
        .filter((x): x is number => x != null)
    )
  );
  const flavorMap = new Map<number, string>();
  if (flavorIds.length > 0) {
    const { data: flavs } = await supabase
      .from("humor_flavors")
      .select("id, slug")
      .in("id", flavorIds);
    (flavs ?? []).forEach((f) => flavorMap.set(f.id as number, f.slug as string));
  }

  const rows: StatRow[] = ranked.map((r) => {
    const c = contentMap.get(r.caption_id);
    const fid = c?.humor_flavor_id ?? null;
    return {
      caption_id: r.caption_id,
      content: c?.content ?? "",
      flavor: fid != null ? flavorMap.get(fid) ?? null : null,
      up: r.up,
      down: r.down,
      net: r.net,
      total: r.total,
      like_count: c?.like_count ?? 0,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Caption Stats</h1>
        <p className="mt-1 text-sm text-gray-600">
          How users are voting on captions. Each vote is an up (+1) or down (−1) signal; net is the sum of vote values.
        </p>
      </div>

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Couldn&apos;t load all votes: {loadError}
        </div>
      )}

      {/* Dashboard tiles */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total votes" value={totalVotes.toLocaleString()} />
        <StatCard label="Captions rated" value={captionsRated.toLocaleString()} />
        <StatCard label="Upvotes" value={up.toLocaleString()} sub={`${upPct}%`} accent="green" />
        <StatCard label="Downvotes" value={down.toLocaleString()} sub={`${downPct}%`} accent="red" />
        <StatCard label="Net score" value={(net > 0 ? "+" : "") + net.toLocaleString()} accent={net >= 0 ? "green" : "red"} />
        <StatCard label="Avg votes / caption" value={avgVotes.toFixed(1)} />
      </div>

      {/* Up vs down split */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-gray-500">
          <span className="text-green-700">Up · {up.toLocaleString()}</span>
          {neutral > 0 && <span className="text-gray-400">Neutral · {neutral.toLocaleString()}</span>}
          <span className="text-red-600">Down · {down.toLocaleString()}</span>
        </div>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="bg-green-500" style={{ width: `${upPct}%` }} />
          <div className="bg-red-400" style={{ width: `${downPct}%` }} />
        </div>
      </div>

      {/* Ranked table */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">
          Top {Math.min(TABLE_LIMIT, rows.length)} most-rated captions
          <span className="ml-2 font-normal text-gray-500">— click a column to sort</span>
        </h2>
        <StatsTable rows={rows} />
        {truncated && (
          <p className="mt-2 text-xs text-amber-600">
            Vote scan hit the safety cap; totals reflect the first {(MAX_PAGES * VOTE_PAGE).toLocaleString()} votes.
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: "green" | "red" }) {
  const valueColor = accent === "green" ? "text-green-700" : accent === "red" ? "text-red-600" : "text-gray-900";
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${valueColor}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}