import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    // Optional links shown at the top of a project post
    repo: z.url().optional(),
    demo: z.url().optional(),
    status: z.enum(['idea', 'in-progress', 'shipped', 'shelved']).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
