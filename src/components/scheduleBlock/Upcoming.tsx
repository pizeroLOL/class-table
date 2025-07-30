import { createMemo, from } from "solid-js";
import z from "zod";
import { dayMs, mondayMap } from ".";
import { inspect } from "../../utils/func";
import { UpcomingCourses } from "../../utils/settings";
import { day } from "../../utils/time";
import PillCard from "../PillCard";

export default (props: {
  schedule: ClassBlock[];
  option: z.infer<typeof UpcomingCourses>;
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
  const rawRightStatus = createMemo(() =>
    props.schedule
      .filter(
        (block) =>
          offsetTime() <= block.start_time &&
          (props.option.crossDay
            ? true
            : block.start_time < Math.ceil(offsetTime() / day) * day),
      )
      .map(inspect("d"))
      .slice(0, props.option.length)
      .map((it) => it.simplified_name),
  );
  const rightStatus = createMemo(() =>
    rawRightStatus().length == props.option.length ||
    props.schedule.length < props.option.length ||
    !props.option.crossDay
      ? rawRightStatus()
      : rawRightStatus().concat(
          props.schedule
            .slice(0, props.option.length - rawRightStatus().length)
            .map((it) =>
              props.option.mode == "long" ? it.subject : it.simplified_name,
            ),
        ),
  );
  return (
    <PillCard>
      {rightStatus().map((it) => (
        <div>{it}</div>
      ))}
    </PillCard>
  );
};
