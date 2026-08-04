/**
 * Structured data, server-rendered.
 *
 * A plain `<script type="application/ld+json">` — no client JS, present in the
 * initial HTML, which is the only version a crawler is guaranteed to read.
 *
 * `JSON.stringify` output is escaped for `</script>` before it goes in: a
 * lesson title containing that sequence would otherwise close the tag early
 * and inject markup. The `\\u003c` form stays valid JSON to any parser.
 */
export function JsonLd({ data, id }: { data: unknown; id?: string }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
