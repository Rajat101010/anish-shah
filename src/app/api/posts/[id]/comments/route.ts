import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cleanText, hasProfanity } from "@/lib/validation";
const recent=new Map<string,number>();
export async function POST(req:NextRequest,{params}:{params:Promise<{id:string}>}) {
 try {
 const {id}=await params;const body=await req.json();
 if(body.website) return NextResponse.json({ok:true}); // honeypot
 const name=cleanText(body.name,80), text=cleanText(body.text,500),device=cleanText(body.deviceId,100);
 const ip=req.headers.get("x-forwarded-for")?.split(",")[0]||"unknown", now=Date.now();
 if(now-(recent.get(ip)||0)<15000)return NextResponse.json({error:"Please wait before commenting again."},{status:429});
 if(!name||text.length<2||!device)return NextResponse.json({error:"Name and comment are required."},{status:400});
 if(hasProfanity(text))return NextResponse.json({error:"Please keep comments respectful."},{status:400});
 if(!(await db.post.findUnique({where:{id}})))return NextResponse.json({error:"Post not found."},{status:404});
 recent.set(ip,now);await db.comment.create({data:{postId:id,name,text,approved:true}});
 return NextResponse.json({ok:true},{status:201});
 }catch{return NextResponse.json({error:"Unable to submit comment."},{status:500})}
}