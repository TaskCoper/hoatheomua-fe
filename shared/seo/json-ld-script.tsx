import { serializeJsonLd } from './serialize-json-ld'

/** Renders a JSON-LD `<script>` with the payload safely serialized. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />
}
