import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const publications = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/publications' }),
  schema: z.object({
    title: z.string(),
    authors: z.string(),
    venue: z.string(),
    year: z.number(),
    order: z.number(),
    paperUrl: z.string().optional(),
    doiUrl: z.string().optional(),
    videoUrl: z.string().optional(),
    previewVideo: z.string().optional(),
    previewPlaceholder: z.string().optional(),
    award: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    venue: z.string().optional(),
    year: z.number(),
    order: z.number(),
    image: z.string(),
    award: z.string().optional(),
    projectUrl: z.string().optional(),
  }),
});

export const collections = { publications, projects };
