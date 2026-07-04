// Renders a JSON-LD structured-data <script>. Static-export safe: the JSON is
// serialized at build time and pre-rendered straight into the static HTML, so
// it works in both server and client component trees with no runtime cost.
// Accepts a single schema object or an array of them.
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is trusted, build-time content — never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
