import { createSignal, onCleanup } from "solid-js";
import z from "zod";
import { UpcomingCourses } from "../../utils/settings";
import PillCard from "../PillCard";
import { dayMs, mondayMap } from ".";
import { day } from "../../utils/time";

export default (props: {
  schedule: ClassBlock[];
  option: z.infer<typeof UpcomingCourses>;
  rawStart: Date;
}) => {
  const start =
    props.rawStart.setHours(0, 0, 0, 0) -
    mondayMap[props.rawStart.getDay()] * dayMs;
  const [offsetTime, setOffsetTime] = createSignal(
    Math.floor(((Date.now() - start) % (14 * dayMs)) / 1000),
  );
  const countDown = setInterval(() =>
    setOffsetTime(Math.floor(((Date.now() - start) % (14 * dayMs)) / 1000)),
  );
  onCleanup(() => clearInterval(countDown));
  const rawRightStatus = props.schedule
    .filter(
      (block) =>
        offsetTime() <= block.start_time &&
        (props.option.crossDay
          ? true
          : block.start_time < Math.ceil(offsetTime() / day) * day),
    )
    .slice(0, props.option.length)
    .map((it) => it.simplified_name);
  const rightStatus =
    rawRightStatus.length == props.option.length ||
    props.schedule.length < props.option.length
      ? rawRightStatus
      : rawRightStatus.concat(
          props.schedule
            .slice(0, props.option.length - rawRightStatus.length)
            .map((it) => it.subject),
        );
  return (
    <PillCard>
      {rightStatus.map((it) => (
        <div>{it}</div>
      ))}
    </PillCard>
  );
};
