import { createMemo, from } from "solid-js";
import z from "zod";
import { dayMs, mondayMap } from ".";
import { OngoingCourses } from "../../utils/settings";
import { blurTime, time } from "../../utils/time";
import PillCard from "../PillCard";

export default (props: {
  schedule: ClassBlock[];
  option: z.infer<typeof OngoingCourses>;
  rawStart: Date;
}) => {
  const start =
    props.rawStart.setHours(0, 0, 0, 0) -
    mondayMap[props.rawStart.getDay()] * dayMs;
  const offsetTime = from((set) => {
    const interval = setInterval(() => {
      set(Math.floor(((Date.now() - start) % (14 * dayMs)) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, 0);
  const rawCurrentStatus = createMemo(() =>
    props.schedule
      .filter(
        (it) => it.start_time <= offsetTime() && offsetTime() < it.end_time,
      )
      .map(
        (it) =>
          ({
            ...it,
            name: it.subject,
            secs: it.end_time - offsetTime(),
          }) as CurrentClass,
      ),
  );
  const nextClassStart = createMemo(
    () => props.schedule.find((it) => it.start_time > offsetTime())?.start_time,
  );
  const defaultClass = () => ({
    end_time:
      nextClassStart() ??
      (props.schedule.length == 0
        ? Infinity
        : 14 * 24 * 60 * 60 +
          props.schedule[0].start_time -
          props.schedule[props.schedule.length - 1].end_time),
    name: "下课",
    secs:
      nextClassStart() !== undefined
        ? nextClassStart()! - offsetTime()
        : props.schedule.length == 0
          ? Infinity
          : 14 * 24 * 60 * 60 - offsetTime() + props.schedule[0].start_time,
  });
  const currentStatus = createMemo(() =>
    rawCurrentStatus().length >= 1
      ? rawCurrentStatus()
      : ([defaultClass()] as CurrentClass[]),
  );
  return (
    <PillCard>
      {currentStatus().map((it) => (
        <div class="flex gap-1">
          <div class="font-bold">{it.name}</div>
          {it.room && <div>{it.room}</div>}
          {it.teacher && <div>{it.teacher}</div>}
          <div>{props.option.blur ? blurTime(it.secs) : time(it.secs)}</div>
        </div>
      ))}
    </PillCard>
  );
};
