import CsesBlock from "./components/CsesBlock";
import Time from "./components/TimeBlock";

function App() {
  const Components = () => [<Time />, <CsesBlock />];
  return (
    <main class="font-normal w-fit mx-auto font-sans gap-2 h-dvh flex items-center justify-center">
      <Components />
    </main>
  );
}

export default App;
