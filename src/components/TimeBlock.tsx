import { createSignal, onCleanup } from "solid-js";
import PillCard from "./PillCard";

function createTime() {
  const t = new Date();
  const formatUnit = (i: number) => i.toString().padStart(2, "0");
  const y = t.getFullYear();
  const mo = t.getMonth() + 1;
  const d = t.getDate();
  const h = formatUnit(t.getHours());
  const m = formatUnit(t.getMinutes());
  const s = formatUnit(t.getSeconds());
  return { date: `${y}/${mo}/${d}`, time: `${h}:${m}:${s}` };
}

export default () => {
  const [time, setTime] = createSignal(createTime());
  const timer = setInterval(() => {
    setTime(createTime());
  }, 500);
  onCleanup(() => {
    clearInterval(timer);
  });
  return (
    <PillCard>
      <div>{time().date}</div>
      <div class="font-bold">{time().time}</div>
    </PillCard>
  );
};
