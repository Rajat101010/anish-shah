import { GalleryFeed } from "@/components/gallery-feed";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Gallery() {
  let posts:any[]=[];
  try { posts=await db.post.findMany({orderBy:[{pinned:"desc"},{order:"asc"},{createdAt:"desc"}],include:{_count:{select:{likes:true,comments:{where:{approved:true}}}}},take:12}); } catch {}
  return <main className="container min-h-[75vh] py-12"><p className="gold mb-3 text-xs font-bold uppercase tracking-[.3em]">The portfolio</p><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-4xl font-black">Gallery</h1><p className="muted mt-2">Real cuts. Real people. Real stories.</p></div><span className="muted text-sm">{posts.length} posts</span></div><GalleryFeed initialPosts={JSON.parse(JSON.stringify(posts))}/></main>;
}