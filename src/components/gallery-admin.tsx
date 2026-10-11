
"use client";

import { useState } from "react";

export function GalleryAdmin({ posts: initial }: { posts: any[] }) {
  const [posts, setPosts] = useState(initial);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [alt, setAlt] = useState("");
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("");

    if (!file) {
      setMsg("Please choose an image or video first.");
      return;
    }

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    const maxSize = isImage ? 8 * 1024 * 1024 : 50 * 1024 * 1024;

    if (!isImage && !isVideo) {
      setMsg("Please select a supported image or video.");
      return;
    }

    if (file.size > maxSize) {
      setMsg(
        `File too large. Maximum size is ${isImage ? "8 MB" : "50 MB"}.`
      );
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const uploaded = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploaded.error || "Upload failed.");
      }

      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mediaUrl: uploaded.mediaUrl,
          mediaType: uploaded.mediaType,
          caption,
          altText: alt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save post.");
      }

      setPosts((current) => [data.post, ...current]);
      setFile(null);
      setCaption("");
      setAlt("");
      setFileInputKey((key) => key + 1);
      setMsg("Media uploaded and post published successfully.");
    } catch (error) {
      setMsg(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setUploading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this post and its comments/likes?")) return;

    const response = await fetch("/api/admin/posts/" + id, {
      method: "DELETE",
    });

    if (response.ok) {
      setPosts((current) => current.filter((post) => post.id !== id));
    } else {
      setMsg("Could not delete post.");
    }
  }

  return (
    <>
      <form onSubmit={add} className="panel mb-8 grid gap-4 p-5">
        <h2 className="text-xl font-bold">Upload image or video</h2>

        <label className="grid gap-2">
          <span className="text-sm font-medium">Choose media file</span>
          <input
            key={fileInputKey}
            className="field"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            required
            disabled={uploading}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>

        {file && (
          <p className="muted text-sm">
            Selected: {file.name} (
            {(file.size / (1024 * 1024)).toFixed(2)} MB)
          </p>
        )}

        <input
          className="field"
          placeholder="Alt text (accessibility)"
          value={alt}
          disabled={uploading}
          onChange={(e) => setAlt(e.target.value)}
        />

        <textarea
          className="field"
          placeholder="Caption (optional)"
          value={caption}
          disabled={uploading}
          onChange={(e) => setCaption(e.target.value)}
        />

        <button className="btn" type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload and publish"}
        </button>

        {msg && (
          <p role="status" className="muted">
            {msg}
          </p>
        )}
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article className="panel overflow-hidden" key={post.id}>
            {post.mediaType === "video" ? (
              <video
                className="h-48 w-full object-cover"
                src={post.mediaUrl}
                muted
                controls
              />
            ) : (
              <img
                className="h-48 w-full object-cover"
                src={post.mediaUrl}
                alt={post.altText}
              />
            )}

            <div className="p-4">
              <p className="mb-3">
                {post.caption || "No caption"} {post.pinned && "· Pinned"}
              </p>

              <div className="flex gap-2">
                <form action={"/api/admin/posts/" + post.id + "/pin"} method="post">
                  <button className="btn-outline text-sm" type="submit">
                    {post.pinned ? "Unpin" : "Pin"}
                  </button>
                </form>

                <button
                  type="button"
                  className="rounded-full border border-red-800 px-4 py-2 text-sm text-red-300"
                  onClick={() => remove(post.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
