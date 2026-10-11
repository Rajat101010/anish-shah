import { NextRequest,NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cleanText,hasProfanity } from "@/lib/validation";
const recent=new Map<string,number>();
export async function POST(req:NextRequest) {
 try {const b=await req.json();const name=cleanText(b.name,80),feedback=cleanText(b.feedback,1000),deviceId=cleanText(b.deviceId,100),rating=Number(b.rating);
 if(!name||feedback.length<3||!deviceId||!Number.isInteger(rating)||rating<1||rating>5)return NextResponse.json({error:"Please complete all fields."},{status:400});
 if(hasProfanity(feedback))return NextResponse.json({error:"Please keep feedback respectful."},{status:400});
 const key=`${deviceId}:${new Date().toISOString().slice(0,10)}`;if(recent.has(key))return NextResponse.json({error:"One review per device per day, please."},{status:429});
 const since=new Date();since.setHours(0,0,0,0);const exists=await db.review.findFirst({where:{deviceId,createdAt:{gte:since}}});if(exists)return NextResponse.json({error:"One review per device per day, please."},{status:429});
 recent.set(key,Date.now());await db.review.create({data:{name,rating,feedback,deviceId,status:"PENDING"}});
 return NextResponse.json({ok:true},{status:201});
 }catch{return NextResponse.json({error:"Unable to submit review."},{status:500})}
}