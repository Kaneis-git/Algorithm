import { z } from "zod";
const text = z.string().max(1200);
const base = {
  id: z.string().min(1).max(100), title: z.string().min(1).max(1200), description: text,
  url: z.string().max(4000).url().refine((s) => { const u = new URL(s); return ["https:", "http:"].includes(u.protocol) && !u.username && !u.password; }),
  source: z.string().max(300), relevanceScore: z.number().min(0).max(100),
};
export const resultSchema = z.discriminatedUnion("type", [
  z.object({ ...base, type: z.literal("github"), repositoryName: text, owner: text, stars: z.number().nonnegative(), forks: z.number().nonnegative(), language: text, topics: z.array(z.string().max(100)).max(20), updatedAt: text }),
  z.object({ ...base, type: z.literal("web"), domain: text, publishedAt: text }),
  z.object({ ...base, type: z.literal("ppt"), domain: text, fileType: z.enum(["PPT", "PPTX", "PDF", "SLIDES"]) }),
  z.object({ ...base, type: z.literal("video"), author: text, publishedAt: text, duration: text, thumbnailLabel: text }),
]);
