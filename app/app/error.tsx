'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="container page-intro">
      <p className="eyebrow">Heuresis Capital</p>
      <h1>Please try again.</h1>
      <p className="lead">
        We couldn’t load this page. Please retry in a moment.
      </p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
