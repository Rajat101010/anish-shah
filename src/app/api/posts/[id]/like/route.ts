import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cleanText } from "@/lib/validation";
export async function POST(req:NextRequest,{params}:{params:Promise<{id:string}>}) {
 try { const {id}=await params; const body=await req.json(); const deviceId=cleanText(body.deviceId,100);
 if(!deviceId) return NextResponse.json({error:"Device ID required"},{status:400});
 const post=await db.post.findUnique({where:{id}});if(!post)return NextResponse.json({error:"Post not found"},{status:404});
 try { await db.like.create({data:{postId:id,deviceId}}); } catch {}
 const count=await db.like.count({where:{postId:id}});
 return NextResponse.json({count});
 } catch { return NextResponse.json({error:"Unable to like post"},{status:500}); }
}