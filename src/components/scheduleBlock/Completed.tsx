import { createMemo, from } from "solid-js";
import z from "zod";
import { dayMs, mondayMap } from ".";
import { CompletedCourses } from "../../utils/settings";
import { day } from "../../utils/time";
import PillCard from "../PillCard";

export default (props: {
  schedule: ClassBlock[];
  option: z.infer<typeof CompletedCourses>;
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
  const rawLeftStatus = createMemo(() =>
    props.schedule
      .filter(
        (block) =>
          block.end_time < offsetTime() &&
          (props.option.crossDay
            ? true
            : block.end_time > Math.floor(offsetTime() / day) * day),
      )
      .slice(-props.option.length)
      .map((it) => it.simplified_name),
  );
  const leftStatus = createMemo(() =>
    rawLeftStatus().length == props.option.length ||
    props.schedule.length < props.option.length ||
    !props.option.crossDay
      ? rawLeftStatus()
      : props.schedule
          .slice(rawLeftStatus().length - props.option.length)
          .map((it) =>
            props.option.mode == "long" ? it.subject : it.simplified_name,
          )
          .concat(rawLeftStatus()),
  );
  const status = leftStatus();
  return (
    <PillCard>
      {status.length == 0 ? (
        <div>暂无课程</div>
      ) : (
        status.map((it) => <div>{it}</div>)
      )}
    </PillCard>
  );
};
