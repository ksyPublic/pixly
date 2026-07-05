"use client";

// Last-resort boundary for errors thrown in the root layout itself. It replaces
// the entire document, so it renders its own <html>/<body> and cannot rely on
// the design tokens, fonts, or i18n provider (those live inside the layout that
// just failed). Kept deliberately minimal and bilingual (ko + en) with inline
// styles so it always renders.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "2rem",
          textAlign: "center",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          background: "#fbfafc",
          color: "#14161c",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800 }}>
          문제가 발생했어요
          <span style={{ color: "#61656f", fontWeight: 600 }}>
            {" "}
            · Something went wrong
          </span>
        </h1>
        <p
          style={{
            margin: 0,
            maxWidth: "30rem",
            lineHeight: 1.6,
            color: "#61656f",
          }}
        >
          예상치 못한 오류가 생겼어요. 다시 시도해 주세요.
          <br />
          An unexpected error occurred. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "0.5rem",
            border: "none",
            borderRadius: "0.75rem",
            background: "#ff5a2c",
            color: "#ffffff",
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          다시 시도 · Try again
        </button>
      </body>
    </html>
  );
}
