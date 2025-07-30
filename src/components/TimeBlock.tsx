import { createSignal, onCleanup } from "solid-js";
import { z } from "zod";
import { Time } from "../utils/settings";
import PillCard from "./PillCard";

function createTime(isShortTime: boolean) {
  const t = new Date();
  const formatUnit = (i: number) => i.toString().padStart(2, "0");
  const y = t.getFullYear();
  const mo = t.getMonth() + 1;
  const d = t.getDate();
  const h = formatUnit(t.getHours());
  const m = formatUnit(t.getMinutes());
  const s = formatUnit(t.getSeconds());
  return {
    date: `${y}/${mo}/${d}`,
    time: isShortTime ? `${h}:${m}` : `${h}:${m}:${s}`,
  };
}

export default (props: z.infer<typeof Time>) => {
  const isShortTime =
    props.style == "dateShortTime" || props.style == "shortTime";
  const [time, setTime] = createSignal(createTime(isShortTime));
  const timer = setInterval(() => {
    setTime(createTime(isShortTime));
  }, 500);
  onCleanup(() => {
    clearInterval(timer);
  });
  const dateDom = <div>{time().date}</div>;
  const timeDom = (
    <div
      class={
        props.style == "datetime" || props.style == "dateShortTime"
          ? "font-bold"
          : ""
      }
    >
      {time().time}
    </div>
  );
  return (
    <PillCard>
      {(props.style == "date" ||
        props.style == "datetime" ||
        props.style == "dateShortTime") &&
        dateDom}
      {(props.style == "datetime" ||
        props.style == "dateShortTime" ||
        props.style == "time" ||
        props.style == "shortTime") &&
        timeDom}
    </PillCard>
  );
};
