
import { ReviewForm } from "@/components/review-form";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Profile() {
  let reviews: any[] = [];
  let content: any = null;

  try {
    reviews = await db.review.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch {}

  try {
    content = await db.siteContent.findUnique({
      where: { id: "main" },
    });
  } catch {}

  const counts = [5, 4, 3, 2, 1].map((n) => ({
    star: n,
    count: reviews.filter((r) => r.rating === n).length,
  }));

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <main className="container min-h-[75vh] py-12">
      <p className="gold mb-3 text-xs font-bold uppercase tracking-[.3em]">
        Meet your barber
      </p>

      <div className="panel mb-8 grid gap-6 p-6 sm:grid-cols-[150px_1fr] sm:p-8">
        <img
          className="size-36 rounded-full border-2 border-[#e7b94f] object-cover"
          src={content?.profilePhoto || "/images/profile.jpg"}
          alt={content?.name || "Barber portrait"}
        />

        <div>
          <h1 className="text-3xl font-black">
            {content?.name || "Anish Shah"}
          </h1>

          <p className="muted mt-2">
            Barber · Stylist · Confidence builder
          </p>

          <div className="gold mt-4 text-xl">
            {"★".repeat(Math.round(avg))}
            {"☆".repeat(5 - Math.round(avg))}{" "}
            <span className="text-sm text-white">
              {avg.toFixed(1)} / 5 · {reviews.length} reviews
            </span>
          </div>

          <p className="muted mt-4 max-w-2xl leading-7">
            Precision cuts, considered details, and a welcoming chair. Every
            appointment is about helping you look sharp and feel confident.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        <section>
          <h2 className="mb-5 text-2xl font-black">Client reviews</h2>

          {reviews.length === 0 ? (
            <div className="panel muted p-6">
              No approved reviews yet. Be the first to share your experience.
            </div>
          ) : (
            <div className="grid gap-4">
              {reviews.map((r) => (
                <article className="panel p-5" key={r.id}>
                  <div className="flex justify-between gap-3">
                    <strong>{r.name}</strong>
                    <span className="gold">
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </span>
                  </div>

                  <p className="muted mt-1 text-xs">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>

                  <p className="mt-3 leading-7">{r.feedback}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside>
          <h2 className="mb-5 text-2xl font-black">Rating breakdown</h2>

          <div className="panel mb-6 grid gap-3 p-5">
            {counts.map((c) => (
              <div
                className="flex items-center gap-3 text-sm"
                key={c.star}
              >
                <span className="w-8">{c.star} ★</span>

                <div className="h-2 flex-1 overflow-hidden rounded bg-[#28323a]">
                  <div
                    className="h-full bg-[#e7b94f]"
                    style={{
                      width: `${
                        reviews.length
                          ? (c.count / reviews.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <span className="muted w-5 text-right">{c.count}</span>
              </div>
            ))}
          </div>

          <ReviewForm />
        </aside>
      </div>
    </main>
  );
}
