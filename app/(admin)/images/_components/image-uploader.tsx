"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const API_BASE = "https://api.almostcrackd.ai";

const SUPPORTED = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
];

type Stage =
  | "idle"
  | "presign"
  | "upload"
  | "register"
  | "captions"
  | "done"
  | "error";

const STAGE_LABEL: Record<Stage, string> = {
  idle: "",
  presign: "Requesting upload URL…",
  upload: "Uploading image…",
  register: "Registering image…",
  captions: "Generating captions…",
  done: "Done! Redirecting…",
  error: "",
};

async function safeText(res: Response) {
  try {
    return (await res.text()).slice(0, 200);
  } catch {
    return "";
  }
}

export function ImageUploader() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isCommonUse, setIsCommonUse] = useState(false);
  const [generateCaptions, setGenerateCaptions] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);

  const busy = stage !== "idle" && stage !== "error" && stage !== "done";

  async function handleUpload() {
    setError(null);

    if (!file) {
      setError("Please choose an image file.");
      return;
    }
    if (!SUPPORTED.includes(file.type)) {
      setError(
        `Unsupported file type "${file.type || "unknown"}". Allowed: JPEG, PNG, WebP, GIF, HEIC.`
      );
      return;
    }

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setError("You're not signed in. Reload the page and try again.");
        setStage("error");
        return;
      }

      const authHeaders = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Step 1 — presigned URL
      setStage("presign");
      const presignRes = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ contentType: file.type }),
      });
      if (!presignRes.ok) {
        throw new Error(
          `Presign failed (${presignRes.status}): ${await safeText(presignRes)}`
        );
      }
      const { presignedUrl, cdnUrl } = await presignRes.json();
      if (!presignedUrl || !cdnUrl) {
        throw new Error("Presign response was missing presignedUrl or cdnUrl.");
      }

      // Step 2 — PUT bytes to storage
      setStage("upload");
      const putRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) {
        throw new Error(`Upload to storage failed (${putRes.status}).`);
      }

      // Step 3 — register the image
      setStage("register");
      const registerRes = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse }),
      });
      if (!registerRes.ok) {
        throw new Error(
          `Register failed (${registerRes.status}): ${await safeText(registerRes)}`
        );
      }
      const { imageId } = await registerRes.json();
      if (!imageId) {
        throw new Error("Register response was missing imageId.");
      }

      // Step 4 — optional caption generation
      if (generateCaptions) {
        setStage("captions");
        const capRes = await fetch(`${API_BASE}/pipeline/generate-captions`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ imageId }),
        });
        if (!capRes.ok) {
          throw new Error(
            `Caption generation failed (${capRes.status}): ${await safeText(capRes)}`
          );
        }
      }

      setStage("done");
      router.refresh();
      router.push("/images");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
      setStage("error");
    }
  }

  return (
    <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Image file<span className="ml-1 text-red-500">*</span>
        </label>
        <p className="mt-0.5 text-xs text-gray-500">JPEG, PNG, WebP, GIF, or HEIC.</p>
        <input
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-2 block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700"
        />
        {file && (
          <p className="mt-1 text-xs text-gray-500">
            {file.name} · {(file.size / 1024).toFixed(0)} KB · {file.type || "unknown type"}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isCommonUse}
            disabled={busy}
            onChange={(e) => setIsCommonUse(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Common use</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={generateCaptions}
            disabled={busy}
            onChange={(e) => setGenerateCaptions(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Generate captions after upload
          </span>
        </label>
        <p className="text-xs text-gray-500">
          Caption generation runs the LLM pipeline and can take a while.
        </p>
      </div>

      {stage !== "idle" && stage !== "error" && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
          {STAGE_LABEL[stage]}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-gray-100 pt-2">
        <button
          type="button"
          onClick={handleUpload}
          disabled={busy || !file}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Working…" : "Upload image"}
        </button>
        <Link
          href="/images"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}