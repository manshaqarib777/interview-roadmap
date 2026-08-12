import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getTopic } from '@/lib/content';
import { BY_N, hrefOf, type IndexedLesson } from '@/lib/curriculum';
import { TIER_LABEL, TOPIC_INDEX, TOTAL_TOPICS, hrefOfTopic } from '@/lib/topics';
import {
  LOCALE,
  SITE_NAME,
  breadcrumbNode,
  graph,
  topicDescription,
  topicKeywords,
  topicNode,
  topicTitle,
} from '@/lib/seo';
import { TopicReader } from '@/components/topic-reader';
import { JsonLd } from '@/components/json-ld';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return TOPIC_INDEX.map((t) => ({ slug: t.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const topic = await getTopic(slug);
  if (!topic) return {};

  const path = hrefOfTopic(topic);
  const description = topicDescription(topic, topic.minutes);

  return {
    title: topicTitle(topic),
    description,
    keywords: topicKeywords(topic),
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      url: path,
      title: topicTitle(topic),
      description,
      siteName: SITE_NAME,
      locale: LOCALE,
      section: 'Laravel',
      tags: topicKeywords(topic),
    },
    twitter: { card: 'summary_large_image', title: topicTitle(topic), description },
  };
}

export default async function TopicPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const topic = await getTopic(slug);
  if (!topic) notFound();

  const path = hrefOfTopic(topic);
  const owningLessons = topic.owningLessons
    .map((n) => BY_N.get(n))
    .filter((l): l is IndexedLesson => Boolean(l));

  return (
    <div className="page">
      <JsonLd
        id="ld-topic"
        data={graph(
          topicNode(topic, {
            minutes: topic.minutes,
            words: topic.words,
            owningLessons,
            path,
          }),
          breadcrumbNode([
            { name: 'Roadmap', path: '/' },
            { name: 'Laravel topics', path: '/topics' },
            { name: `Topic ${topic.n}`, path },
          ]),
        )}
      />

      <header className="mb-6">
        <p className="eyebrow mb-2.5 flex items-center gap-2">
          <span className="num">
            Topic {topic.n} of {TOTAL_TOPICS}
          </span>
          <span className="text-[var(--input)]">·</span>
          <span>{topic.milestone}</span>
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[2rem] leading-[1.12] font-bold tracking-[-0.02em] text-balance sm:text-[2.5rem]">
            {topic.title}
          </h1>
          <span className="chip shrink-0">{TIER_LABEL[topic.tier]}</span>
        </div>
        {topic.description && (
          <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
            {topic.description}
          </p>
        )}
      </header>

      <TopicReader topic={topic} />
    </div>
  );
}
