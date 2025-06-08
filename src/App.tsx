import Time from "./components/Time";

function App() {
  const Components = () =>
    [<Time></Time>].map((it) => <div class="pill bg-stone-300">{it}</div>);
  return (
    <main class="font-normal w-fit mx-auto font-sans gap-4 h-dvh flex items-center justify-center">
      <Components />
    </main>
  );
}

export default App;
