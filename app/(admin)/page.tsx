import { createClient } from "@/lib/supabase/server";

// Always render fresh — never cache; dashboard counts should be real-time
export const dynamic = "force-dynamic";

type WeeklyBucket = { weekStart: string; count: number };

// Bucket an array of ISO timestamps into the last N weeks (Sunday-start)
function getWeeklyBuckets(timestamps: string[], weeks = 12): WeeklyBucket[] {
  const now = new Date();
  const buckets: WeeklyBucket[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i * 7);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    buckets.push({ weekStart: d.toISOString(), count: 0 });
  }
  timestamps.forEach((ts) => {
    const t = new Date(ts).getTime();
    for (let i = 0; i < buckets.length; i++) {
      const start = new Date(buckets[i].weekStart).getTime();
      const end = start + 7 * 24 * 60 * 60 * 1000;
      if (t >= start && t < end) {
        buckets[i].count++;
        break;
      }
    }
  });
  return buckets;
}

function formatWeek(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default async function Dashboard() {
  const supabase = await createClient();
  const twelveWeeksAgo = new Date(
    Date.now() - 12 * 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const [
    profilesCountRes,
    imagesCountRes,
    captionsCountRes,
    votesCountRes,
    captionsTsRes,
    profilesTsRes,
    topCaptionsRes,
    recentImagesRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("humor_project_images")
      .select("*", { count: "exact", head: true }),
    supabase.from("captions").select("*", { count: "exact", head: true }),
    supabase.from("caption_votes").select("*", { count: "exact", head: true }),
    supabase
      .from("captions")
      .select("created_datetime_utc")
      .gte("created_datetime_utc", twelveWeeksAgo)
      .limit(5000),
    supabase
      .from("profiles")
      .select("created_datetime_utc")
      .gte("created_datetime_utc", twelveWeeksAgo)
      .limit(5000),
    supabase
      .from("caption_scores")
      .select("id, display_text, total_votes")
      .order("total_votes", { ascending: false })
      .limit(10),
    supabase
      .from("humor_project_images")
      .select("id, url, image_description, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const profilesCount = profilesCountRes.count ?? 0;
  const imagesCount = imagesCountRes.count ?? 0;
  const captionsCount = captionsCountRes.count ?? 0;
  const votesCount = votesCountRes.count ?? 0;

  const captionWeeks = getWeeklyBuckets(
    (captionsTsRes.data ?? []).map((r) => r.created_datetime_utc)
  );
  const profileWeeks = getWeeklyBuckets(
    (profilesTsRes.data ?? []).map((r) => r.created_datetime_utc)
  );

  const topCaptions = topCaptionsRes.data ?? [];
  const recentImages = recentImagesRes.data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Overview of activity across The Humor Project.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Users" value={profilesCount} accent="blue" />
        <StatCard label="Images" value={imagesCount} accent="amber" />
        <StatCard label="Captions" value={captionsCount} accent="emerald" />
        <StatCard label="Votes" value={votesCount} accent="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Captions per week"
          subtitle="Last 12 weeks"
          buckets={captionWeeks}
          barColor="bg-emerald-500"
        />
        <ChartCard
          title="New signups per week"
          subtitle="Last 12 weeks"
          buckets={profileWeeks}
          barColor="bg-blue-500"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Top captions</h2>
          <p className="text-sm text-gray-500">By total votes (all time)</p>
        </div>
        {topCaptions.length === 0 ? (
          <p className="text-sm text-gray-500">No captions yet.</p>
        ) : (
          <ol className="space-y-0">
            {topCaptions.map((c, i) => (
              <li
                key={c.id}
                className="flex items-center gap-4 py-3 border-b last:border-0 border-gray-100"
              >
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="flex-1 text-sm text-gray-800 line-clamp-2">
                  {c.display_text}
                </p>
                <span className="flex-shrink-0 text-sm font-semibold text-gray-900 tabular-nums">
                  {c.total_votes ?? 0} votes
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent uploads
          </h2>
          <p className="text-sm text-gray-500">Latest images added</p>
        </div>
        {recentImages.length === 0 ? (
          <p className="text-sm text-gray-500">No images uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {recentImages.map((img) => (
              <div
                key={img.id}
                className="aspect-square rounded-lg bg-gray-100 overflow-hidden border border-gray-200"
              >
                {img.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.url}
                    alt={img.image_description || "image"}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "blue" | "amber" | "emerald" | "purple";
}) {
  const accentMap = {
    blue: "border-l-blue-500",
    amber: "border-l-amber-500",
    emerald: "border-l-emerald-500",
    purple: "border-l-purple-500",
  };
  return (
    <div
      className={`rounded-xl border border-gray-200 border-l-4 ${accentMap[accent]} bg-white p-5 shadow-sm`}
    >
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900 tabular-nums">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  buckets,
  barColor,
}: {
  title: string;
  subtitle: string;
  buckets: WeeklyBucket[];
  barColor: string;
}) {
  const max = Math.max(...buckets.map((b) => b.count), 1);
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <div className="flex items-end gap-1.5 h-40">
        {buckets.map((b, i) => {
          const heightPct = (b.count / max) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex-1 flex items-end">
                <div
                  className={`w-full rounded-t ${barColor}`}
                  style={{
                    height: `${heightPct}%`,
                    minHeight: b.count > 0 ? "2px" : "0px",
                  }}
                  title={`${b.count} on week of ${formatWeek(b.weekStart)}`}
                />
              </div>
              <div className="text-[10px] text-gray-500 tabular-nums">
                {b.count}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-gray-400">
        <span>{formatWeek(buckets[0].weekStart)}</span>
        <span>{formatWeek(buckets[buckets.length - 1].weekStart)}</span>
      </div>
    </div>
  );
}