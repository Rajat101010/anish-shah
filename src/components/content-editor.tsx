
"use client";

import { useState } from "react";

const fallback = {
  name: "Anish Shah",
  siteTitle: "Anish Shah",
  tagline: "Premium barber services",
  bio: "Sharp cuts. Clean looks. Better you.",
  heroImage: "",
  profilePhoto: "",
  yearsExperience: 6,
  seoTitle: "Anish Shah | Premium Barber",
  seoDescription: "Book a premium haircut, beard trim, or shave.",
  accentColor: "#e7b94f",
  services: [
    { name: "Haircut", price: "$25" },
    { name: "Beard trim", price: "$12" },
  ],
  social: [{ label: "Instagram", url: "https://instagram.com" }],
  hours: [{ day: "Mon–Fri", time: "10 AM – 8 PM" }],
};

type Service = { name: string; price: string };
type SocialLink = { label: string; url: string };
type OpeningHour = {
  day: string;
  open: string;
  close: string;
  closed: boolean;
};

function normalizeHours(hours: any[]): OpeningHour[] {
  if (!Array.isArray(hours) || hours.length === 0) {
    return [{ day: "Monday", open: "10:00 AM", close: "8:00 PM", closed: false }];
  }

  return hours.map((item) => {
    const time = String(item.time || "");
    const parts = time.split(/\s*[–—-]\s*/);

    return {
      day: item.day || "Monday",
      open: item.open || parts[0] || "10:00 AM",
      close: item.close || parts[1] || "8:00 PM",
      closed: item.closed ?? /^closed$/i.test(time),
    };
  });
}

export function ContentEditor({ initial }: { initial: any }) {
  const [c, setC] = useState({
    ...fallback,
    ...(initial.content || {}),
  });

  const [loc, setLoc] = useState({
    address: "12 Barber Lane, Kathmandu, Nepal",
    phone: "+977 9800000000",
    mapUrl: "",
    ...(initial.location || {}),
    hours: normalizeHours(initial.location?.hours),
  });

  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadMsg, setUploadMsg] = useState<Record<string, string>>({});

  const services: Service[] = Array.isArray(c.services) ? c.services : [];
  const social: SocialLink[] = Array.isArray(c.social) ? c.social : [];
  const hours: OpeningHour[] = Array.isArray(loc.hours) ? loc.hours : [];

  function updateContent(key: string, value: any) {
    setC((previous: any) => ({ ...previous, [key]: value }));
  }

  function updateLocation(key: string, value: any) {
    setLoc((previous: any) => ({ ...previous, [key]: value }));
  }

  function updateService(index: number, key: keyof Service, value: string) {
    setC((previous: any) => ({
      ...previous,
      services: (previous.services || []).map((item: Service, i: number) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  }

  function updateSocial(index: number, key: keyof SocialLink, value: string) {
    setC((previous: any) => ({
      ...previous,
      social: (previous.social || []).map((item: SocialLink, i: number) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  }

  function updateHour(index: number, key: keyof OpeningHour, value: string | boolean) {
    setLoc((previous: any) => ({
      ...previous,
      hours: previous.hours.map((item: OpeningHour, i: number) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  }

  async function uploadImage(
    key: "heroImage" | "profilePhoto",
    file?: File
  ) {
    if (!file) return;

    setUploadMsg((s) => ({ ...s, [key]: "" }));

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadMsg((s) => ({
        ...s,
        [key]: "Use a JPG, PNG, WEBP, or GIF image.",
      }));
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadMsg((s) => ({
        ...s,
        [key]: "Image must be 8 MB or smaller.",
      }));
      return;
    }

    setUploading((s) => ({ ...s, [key]: true }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Image upload failed.");
      }

      updateContent(key, data.mediaUrl);

      setUploadMsg((s) => ({
        ...s,
        [key]: "Image uploaded. Click Save all changes to save it.",
      }));
    } catch (error) {
      setUploadMsg((s) => ({
        ...s,
        [key]:
          error instanceof Error ? error.message : "Image upload failed.",
      }));
    } finally {
      setUploading((s) => ({ ...s, [key]: false }));
    }
  }

  function imageField(label: string, key: "heroImage" | "profilePhoto") {
    const imageUrl = c[key];

    return (
      <div className="grid gap-3 text-sm">
        <span className="font-medium">{label}</span>

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={label}
            className={
              key === "heroImage"
                ? "h-44 w-full rounded-lg border object-cover"
                : "h-36 w-36 rounded-lg border object-cover"
            }
          />
        ) : (
          <p className="muted">No image selected.</p>
        )}

        <label className="grid gap-2">
          <span className="muted">Choose an image from your device</span>
          <input
            className="field"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={!!uploading[key]}
            onChange={(e) => {
              const file = e.target.files?.[0];
              void uploadImage(key, file);
              e.currentTarget.value = "";
            }}
          />
        </label>

        {uploading[key] && (
          <p role="status" className="muted">Uploading image...</p>
        )}

        {uploadMsg[key] && (
          <p role="status" className="muted">{uploadMsg[key]}</p>
        )}

        <details>
          <summary className="muted cursor-pointer">
            Enter an image URL instead
          </summary>
          <input
            className="field mt-2"
            type="url"
            placeholder="https://..."
            value={imageUrl || ""}
            onChange={(e) => updateContent(key, e.target.value)}
          />
        </details>
      </div>
    );
  }

  async function save() {
    setMsg("");

    const savedHours = hours.map((item) => ({
      day: item.day,
      time: item.closed ? "Closed" : `${item.open} – ${item.close}`,
      open: item.open,
      close: item.close,
      closed: item.closed,
    }));

    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          content: c,
          location: { ...loc, hours: savedHours },
        }),
      });

      const data = await response.json().catch(() => ({}));

      setMsg(
        response.ok
          ? "Changes saved successfully."
          : data.error || "Unable to save changes."
      );
    } catch {
      setMsg("Unable to save changes. Please try again.");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="panel grid gap-5 p-5">
        <h2 className="text-xl font-bold">Home & About</h2>

        <label className="grid gap-2 text-sm">
          Business / barber name
          <input className="field" value={c.name} onChange={(e) => updateContent("name", e.target.value)} />
        </label>

        <label className="grid gap-2 text-sm">
          Site title
          <input className="field" value={c.siteTitle} onChange={(e) => updateContent("siteTitle", e.target.value)} />
        </label>

        <label className="grid gap-2 text-sm">
          Tagline
          <input className="field" value={c.tagline} onChange={(e) => updateContent("tagline", e.target.value)} />
        </label>

        <label className="grid gap-2 text-sm">
          Bio
          <textarea className="field min-h-28" value={c.bio} onChange={(e) => updateContent("bio", e.target.value)} />
        </label>

        {imageField("Hero image", "heroImage")}
        {imageField("Profile photo", "profilePhoto")}

        <label className="grid gap-2 text-sm">
          Years of experience
          <input
            className="field"
            type="number"
            min="0"
            value={c.yearsExperience}
            onChange={(e) => updateContent("yearsExperience", Number(e.target.value))}
          />
        </label>

        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold">Services</h3>
            <button
              type="button"
              className="btn-outline text-sm"
              onClick={() =>
                updateContent("services", [...services, { name: "", price: "" }])
              }
            >
              + Add service
            </button>
          </div>

          {services.map((service, index) => (
            <div key={index} className="grid gap-2 rounded-lg border border-white/10 p-3">
              <label className="grid gap-1 text-sm">
                Service name
                <input
                  className="field"
                  placeholder="e.g. Haircut"
                  value={service.name}
                  onChange={(e) => updateService(index, "name", e.target.value)}
                />
              </label>
              <label className="grid gap-1 text-sm">
                Price
                <input
                  className="field"
                  placeholder="e.g. $25"
                  value={service.price}
                  onChange={(e) => updateService(index, "price", e.target.value)}
                />
              </label>
              <button
                type="button"
                className="justify-self-start text-sm text-red-400"
                onClick={() => updateContent("services", services.filter((_, i) => i !== index))}
              >
                Remove service
              </button>
            </div>
          ))}
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold">Social links</h3>
            <button
              type="button"
              className="btn-outline text-sm"
              onClick={() =>
                updateContent("social", [...social, { label: "", url: "" }])
              }
            >
              + Add link
            </button>
          </div>

          {social.map((item, index) => (
            <div key={index} className="grid gap-2 rounded-lg border border-white/10 p-3">
              <label className="grid gap-1 text-sm">
                Platform name
                <input
                  className="field"
                  placeholder="e.g. Instagram"
                  value={item.label}
                  onChange={(e) => updateSocial(index, "label", e.target.value)}
                />
              </label>
              <label className="grid gap-1 text-sm">
                Profile URL
                <input
                  className="field"
                  type="url"
                  placeholder="https://instagram.com/yourprofile"
                  value={item.url}
                  onChange={(e) => updateSocial(index, "url", e.target.value)}
                />
              </label>
              <button
                type="button"
                className="justify-self-start text-sm text-red-400"
                onClick={() => updateContent("social", social.filter((_, i) => i !== index))}
              >
                Remove link
              </button>
            </div>
          ))}
        </div>

        <label className="grid gap-2 text-sm">
          SEO title
          <input className="field" value={c.seoTitle} onChange={(e) => updateContent("seoTitle", e.target.value)} />
        </label>

        <label className="grid gap-2 text-sm">
          SEO description
          <textarea className="field" value={c.seoDescription} onChange={(e) => updateContent("seoDescription", e.target.value)} />
        </label>

        <label className="grid gap-2 text-sm">
          Accent color
          <input
            className="field min-h-12"
            type="color"
            value={c.accentColor}
            onChange={(e) => updateContent("accentColor", e.target.value)}
          />
        </label>
      </section>

      <section className="panel grid content-start gap-5 p-5">
        <h2 className="text-xl font-bold">Location & opening hours</h2>

        <label className="grid gap-2 text-sm">
          Address
          <input className="field" value={loc.address} onChange={(e) => updateLocation("address", e.target.value)} />
        </label>

        <label className="grid gap-2 text-sm">
          Phone
          <input className="field" value={loc.phone} onChange={(e) => updateLocation("phone", e.target.value)} />
        </label>

        <label className="grid gap-2 text-sm">
          Google Maps URL or embed URL
          <input className="field" type="url" value={loc.mapUrl || ""} onChange={(e) => updateLocation("mapUrl", e.target.value)} />
        </label>

        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold">Opening hours</h3>
            <button
              type="button"
              className="btn-outline text-sm"
              onClick={() =>
                updateLocation("hours", [
                  ...hours,
                  { day: "", open: "10:00 AM", close: "8:00 PM", closed: false },
                ])
              }
            >
              + Add day
            </button>
          </div>

          {hours.map((item, index) => (
            <div key={index} className="grid gap-3 rounded-lg border border-white/10 p-3">
              <label className="grid gap-1 text-sm">
                Day
                <select
                  className="field"
                  value={item.day}
                  onChange={(e) => updateHour(index, "day", e.target.value)}
                >
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Mon–Fri", "Sat–Sun", "Every day"].map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={item.closed}
                  onChange={(e) => updateHour(index, "closed", e.target.checked)}
                />
                Closed on this day
              </label>

              {!item.closed && (
                <div className="grid grid-cols-2 gap-3">
                  <label className="grid gap-1 text-sm">
                    Opening time
                    <input
                      className="field"
                      placeholder="10:00 AM"
                      value={item.open}
                      onChange={(e) => updateHour(index, "open", e.target.value)}
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    Closing time
                    <input
                      className="field"
                      placeholder="8:00 PM"
                      value={item.close}
                      onChange={(e) => updateHour(index, "close", e.target.value)}
                    />
                  </label>
                </div>
              )}

              <button
                type="button"
                className="justify-self-start text-sm text-red-400"
                onClick={() => updateLocation("hours", hours.filter((_, i) => i !== index))}
              >
                Remove day
              </button>
            </div>
          ))}
        </div>

        <button className="btn" type="button" onClick={save}>
          Save all changes
        </button>

        {msg && <p role="status" className="muted">{msg}</p>}
      </section>
    </div>
  );
}
