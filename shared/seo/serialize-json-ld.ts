/**
 * Safely serialize a JSON-LD payload for embedding in a `<script>` tag. Escapes
 * `<` so a stray `</script>` substring in the data can't close the script tag.
 */
export const serializeJsonLd = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c')
