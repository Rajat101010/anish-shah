 "use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Scissors } from "lucide-react";
const links = [["Home","/"],["Gallery","/gallery"],["Profile","/profile"],["Book an Appointment","/book"]];
export function Navbar() {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-50 border-b border-[#27313a] bg-[#080b0e]/95 backdrop-blur">
    <nav className="container flex min-h-[68px] items-center justify-between gap-4">
      <Link href="/" className="flex items-center gap-2 font-black tracking-[.12em]"><Scissors className="gold" size={23}/> ANISH <span className="gold">SHAH</span></Link>
      <div className="hidden items-center gap-7 text-sm md:flex">{links.map(([label,href])=><Link key={href} className="hover:text-[#e7b94f]" href={href}>{label}</Link>)}</div>
      <button aria-label={open?"Close menu":"Open menu"} className="md:hidden" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
    </nav>
    {open && <div className="container grid gap-4 pb-5 md:hidden">{links.map(([label,href])=><Link onClick={()=>setOpen(false)} key={href} href={href}>{label}</Link>)}</div>}
  </header>;
}