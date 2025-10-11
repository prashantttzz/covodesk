import { ConvexError, v } from "convex/values";
import { action, mutation, query, QueryCtx } from "../_generated/server";
import {
  contentHashFromArrayBuffer,
  Entry,
  EntryId,
  guessMimeTypeFromContents,
  guessMimeTypeFromExtension,
  vEntryId,
} from "@convex-dev/rag";
import { rag } from "../system/ai/rag";
import { ExtractTextContent } from "../lib/extractTextContent";
import { Id } from "../_generated/dataModel";
import { paginationOptsValidator } from "convex/server";

export type PublicFile = {
  id: EntryId;
  type: string;
  name: string;
  size: string;
  category?: string;
  status: "ready" | "processing" | "error";
  url: string | null;
};

type metaData = {
  storageId: Id<"_storage">;
  uploadBy: string;
  fileNam: string;
  category: string | null;
};

function guessMimeType(fileName: string, bytes: ArrayBuffer) {
  return (
    guessMimeTypeFromExtension(fileName) ||
    guessMimeTypeFromContents(bytes) ||
    "application/octet-stream"
  );
}

export const deleteFile = mutation({
  args: {
    entryId: vEntryId,
  },
  handler: async (ctx, args) => {
    const indentity = await ctx.auth.getUserIdentity();
    if (!indentity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }
    const org = indentity.orgId as string;
    if (!org) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "organizationID not found",
      });
    }
    const namespace = await rag.getNamespace(ctx, { namespace: org });
    if (!namespace) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "invalid namespace",
      });
    }
    const entry = await rag.getEntry(ctx, { entryId: args.entryId });
    if (!entry) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "entry not found",
      });
    }
    if (!entry.metadata?.uploadedBy) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "invalid organization ID",
      });
    }
    if (entry.metadata?.storageId) {
      await ctx.storage.delete(entry.metadata.storageId as Id<"_storage">);
    }
    await rag.deleteAsync(ctx, { entryId: args.entryId });
  },
});

export const addFile = action({
  args: {
    fileName: v.string(),
    mimeType: v.string(),
    bytes: v.bytes(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const indentity = await ctx.auth.getUserIdentity();
    if (!indentity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }
    const org = indentity.orgId as string;
    if (!org) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "organizationID not found",
      });
    }
    const { category, fileName, bytes } = args;
    const mimeType = args.mimeType || guessMimeType(fileName, bytes);
    const blob = new Blob([bytes], { type: mimeType });
    const storageId = await ctx.storage.store(blob);
    const text = await ExtractTextContent(ctx, {
      mimeType,
      fileName,
      storageId,
      bytes,
    });

    const { created, entryId } = await rag.add(ctx, {
      namespace: org,
      text,
      title: fileName,
      metadata: {
        storageId,
        uploadedBy: org,
        fileName,
        category: category ?? null,
      },
      contentHash: await contentHashFromArrayBuffer(bytes),
    });
    if (!created) {
      console.debug("entry already existed ,skipping upload metadata");
      await ctx.storage.delete(storageId);
    }
    return {
      url: await ctx.storage.getUrl(storageId),
      entryId,
    };
  },
});

export const listFiles = query({
  args: {
    category: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const indentity = await ctx.auth.getUserIdentity();
    if (!indentity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }
    const org = indentity.orgId as string;
    if (!org) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "organizationID not found",
      });
    }
    const namespace = await rag.getNamespace(ctx, { namespace: org });
    if (!namespace) {
      return { page: [], isDone: true, continueCursor: "" };
    }
    const result = await rag.list(ctx, {
      namespaceId: namespace.namespaceId,
      paginationOpts: args.paginationOpts,
    });

    const files = await Promise.all(
      result.page.map((entry) => convertEntryToPublicFile(ctx, entry))
    );
    const filteredFiles = args.category
      ? files.filter((file) => file.category === args.category)
      : files;

    return {
      page: filteredFiles,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});

async function convertEntryToPublicFile(
  ctx: QueryCtx,
  entry: Entry
): Promise<PublicFile> {
  const metadata = entry.metadata as metaData | undefined;
  const storageId = metadata?.storageId;
  let fileSize = "unknown";
  if (storageId) {
    try {
      const storageMetadata = await ctx.db.system.get(storageId);
      if (storageMetadata) {
        fileSize = formatFileSize(storageMetadata.size);
      }
    } catch (error) {
      console.error("failed to get storage size", error);
    }
  }
  const fileName = entry.title || "unknown";
  const extension = fileName.split(".").pop()?.toLowerCase() || "txt";
  let status: "ready" | "processing" | "error" = "error";
  if (entry.status === "ready") {
    status = "ready";
  } else if (entry.status === "pending") {
    status = "processing";
  }

  const url = storageId ? await ctx.storage.getUrl(storageId) : null;
  return {
    id: entry.entryId,
    name: fileName,
    size: fileSize,
    type: extension,
    category: metadata?.category || undefined,
    status,
    url,
  };
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}
