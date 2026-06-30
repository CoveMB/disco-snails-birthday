import "./styles.css";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("Missing #app root element.");
}

root.innerHTML = `
  <main class="boilerplate-shell">
    <section class="boilerplate-card" aria-labelledby="birthday-title">
      <p class="eyebrow">Disco Snails Present</p>
      <h1 id="birthday-title">Happy Birthday</h1>
      <p>The dance floor is warming up.</p>
    </section>
  </main>
`;
