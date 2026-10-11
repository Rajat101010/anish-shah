import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
const db=new PrismaClient();
async function main(){
 const email=(process.env.ADMIN_EMAIL||"admin@example.com").toLowerCase();
 const password=process.env.ADMIN_PASSWORD||"ChangeThisToALongUniquePassword!";
 await db.admin.upsert({where:{email},update:{name:process.env.ADMIN_NAME||"Site Admin",passwordHash:await hash(password,12)},create:{name:process.env.ADMIN_NAME||"Site Admin",email,passwordHash:await hash(password,12)}});
 await db.siteContent.upsert({where:{id:"main"},update:{},create:{id:"main",siteTitle:"Fade & Forge",name:"Fade & Forge",tagline:"Premium barber services",bio:"Sharp cuts. Clean looks. Better you. Precision fades and considered grooming in a welcoming space.",yearsExperience:6,heroImage:"https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1800&q=85",profilePhoto:"https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=85",services:[{name:"Haircut",price:"$25"},{name:"Beard trim",price:"$12"},{name:"Classic shave",price:"$15"},{name:"Hair wash & style",price:"$10"}],hours:[{day:"Mon–Fri",time:"10:00 AM – 8:00 PM"},{day:"Saturday",time:"10:00 AM – 6:00 PM"},{day:"Sunday",time:"By appointment"}],social:[{label:"Instagram",url:"https://instagram.com"}],seoTitle:"Fade & Forge | Premium Barber",seoDescription:"Book a premium haircut, beard trim, or shave.",accentColor:"#e7b94f"}});
 await db.location.upsert({where:{id:"main"},update:{},create:{id:"main",address:"12 Barber Lane, Kathmandu, Nepal",phone:"+977 9800000000",mapUrl:"https://maps.google.com",hours:[{day:"Mon–Fri",time:"10:00 AM – 8:00 PM"},{day:"Saturday",time:"10:00 AM – 6:00 PM"}]}});
 const media=[
  ["https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=85","Clean fade, sharp finish."],
  ["https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=85","Precision in every detail."],
  ["https://images.unsplash.com/photo-1593702295094-aea2c3c9f2d9?auto=format&fit=crop&w=1200&q=85","Classic barber craft."],
  ["https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=85","Fresh cut, fresh confidence."],
  ["https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1200&q=85","Made for your style."],
  ["https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=1200&q=85","The details make the difference."]
 ];
 for(let i=0;i<media.length;i++){const url=media[i][0];if(!(await db.post.findFirst({where:{mediaUrl:url}})))await db.post.create({data:{mediaUrl:url,mediaType:"image",caption:media[i][1],altText:"Barber portfolio haircut",pinned:i===0,order:i}})}
 const existing=await db.review.count();if(!existing)await db.review.createMany({data:[{name:"Rahul Sharma",rating:5,feedback:"Great experience! Clean fade and perfect beard trim.",deviceId:"seed-review-1",status:"APPROVED"},{name:"Anita Rai",rating:5,feedback:"Very professional and friendly. Highly recommended.",deviceId:"seed-review-2",status:"APPROVED"},{name:"Sujan Karki",rating:4,feedback:"Great service. Loved the haircut. Will visit again.",deviceId:"seed-review-3",status:"APPROVED"}]});
 const links=await db.bookingLink.count();if(!links)await db.bookingLink.createMany({data:[{title:"Instagram DM",url:"https://instagram.com",icon:"instagram",description:"Message us directly on Instagram.",order:0},{title:"WhatsApp",url:"https://wa.me/9779800000000",icon:"whatsapp",description:"Quick and easy booking via WhatsApp.",order:1},{title:"Phone Call",url:"tel:+9779800000000",icon:"phone",description:"Call directly for instant booking.",order:2}]});
 console.log(`Seeded. Admin: ${email}. Set ADMIN_PASSWORD securely before running this script.`);
}
main().finally(()=>db.$disconnect());