import {
  createResource,
  createSignal,
  onCleanup,
  createEffect,
  Show,
  Switch,
  Match,
} from "solid-js";
import { z } from "zod";
import PillCard from "../PillCard.tsx";
import { BaseDirectory, readTextFile } from "@tauri-apps/plugin-fs";

const classTime = /([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)/;
const Class = z.object({
  subject: z.string().min(1),
  start_time: z.string().regex(classTime),
  end_time: z.string().regex(classTime),
});

const Schedule = z.object({
  name: z.string().min(1),
  enable_day: z.number().min(1).max(7),
  weeks: z.union([z.literal("all"), z.literal("odd"), z.literal("even")]),
  classes: z.array(Class),
});

const Subject = z.object({
  name: z.string().min(1),
  room: z.string().min(1).optional(),
  teacher: z.string().min(1).optional(),
  simplified_name: z.string().min(1).optional(),
});

const Cses = z.object({
  version: z.literal(1),
  subjects: z.array(Subject),
  schedules: z.array(Schedule),
});

function matchCsesTime(time: string): number {
  const [hour, minute, second] = time.split(":").map(Number);
  return hour * 3600 + minute * 60 + second;
}

export function intoClassBlockList(config: z.infer<typeof Cses>): ClassBlock[] {
  const weeksMap = {
    odd: 0,
    even: 0,
    all: 1,
  };
  const rawSchedules = config.schedules
    .reverse()
    .sort((a, b) => weeksMap[a.weeks] - weeksMap[b.weeks]);
  const subjectInfo: Record<string, SubjectInfo> = {};
  config.subjects.forEach((it) => {
    subjectInfo[it.name] = it;
  });
  return new Array(14).fill([] as ClassBlock[]).flatMap(
    (_, day) =>
      rawSchedules
        .find(
          (schedule) =>
            (schedule.weeks == "all" ||
              schedule.weeks == (day > 6 ? "even" : "odd")) &&
            schedule.enable_day == (day % 7) + 1,
        )
        ?.classes.map((it) => ({
          ...it,
          ...(subjectInfo[it.subject] ?? {}),
          start_time: day * 86400 + matchCsesTime(it.start_time),
          end_time: day * 86400 + matchCsesTime(it.end_time),
          simplified_name:
            (subjectInfo[it.subject].simplified_name ?? it.subject.length >= 1)
              ? it.subject[0]
              : "课",
        }))
        .sort((a, b) => a.start_time - b.start_time) ?? [],
  );
}

export function getStatus(
  blocks: ClassBlock[],
  left: number,
  right: number,
  offset_time: number,
): CountDown {
  const rawLeftStatus = blocks
    .filter((block) => block.end_time < offset_time)
    .slice(-left)
    .map((it) => it.simplified_name);
  const leftStatus =
    rawLeftStatus.length == left || blocks.length < left
      ? rawLeftStatus
      : blocks
          .slice(rawLeftStatus.length - left)
          .map((it) => it.subject)
          .concat(rawLeftStatus);
  const rawRightStatus = blocks
    .filter((block) => offset_time <= block.start_time)
    // .map(inspect)
    .slice(0, right)
    .map((it) => it.simplified_name);
  const rightStatus =
    rawRightStatus.length == right || blocks.length < right
      ? rawRightStatus
      : rawRightStatus.concat(
          blocks
            .slice(0, right - rawRightStatus.length)
            .map((it) => it.subject),
        );
  const rawCurrentStatus = blocks
    .filter((it) => it.start_time <= offset_time && offset_time < it.end_time)
    .map(
      (it) =>
        ({
          ...it,
          name: it.subject,
          secs: it.end_time - offset_time,
        }) as CurrentClass,
    );
  const nextClassStart = blocks.find(
    (it) => it.start_time > offset_time,
  )?.start_time;
  const currentStatus =
    rawCurrentStatus.length >= 1
      ? rawCurrentStatus
      : ([
          {
            end_time:
              nextClassStart !== undefined
                ? nextClassStart
                : blocks.length == 0
                  ? Infinity
                  : 14 * 24 * 60 * 60 +
                    blocks[0].start_time -
                    blocks[blocks.length].end_time,
            name: "下课",
            secs:
              nextClassStart !== undefined
                ? nextClassStart - offset_time
                : blocks.length == 0
                  ? Infinity
                  : 14 * 24 * 60 * 60 - offset_time + blocks[0].start_time,
          },
        ] as CurrentClass[]);
  return {
    left: leftStatus,
    current: currentStatus,
    right: rightStatus,
  };
}

const blurTime = (sec: number) =>
  sec < 30
    ? `<${30}s`
    : sec < 60
      ? `<${60}s`
      : sec < 60 * 60
        ? `<${Math.floor(sec / 60) + 1}m`
        : sec < 24 * 60 * 60
          ? `<${Math.floor(sec / 60 / 60) + 1}h`
          : `<${Math.floor(sec / 24 / 60 / 60) + 1}d`;

const dayMs = 24 * 60 * 60 * 1000;
const mondayMap = [6, 0, 1, 2, 3, 4, 5];

function InnerCses(props: { config?: z.infer<typeof Cses> }) {
  const x = props.config;
  if (!x) {
    return <PillCard>no config</PillCard>;
  }
  const rawStart = new Date(2025, 6, 1);
  const start =
    rawStart.setHours(0, 0, 0, 0) - mondayMap[rawStart.getDay()] * dayMs;
  const [time, setTime] = createSignal({
    left: [],
    current: [],
    right: [],
  } as CountDown);
  const timer = setInterval(() => {
    const ot = Math.floor(((Date.now() - start) % (14 * dayMs)) / 1000);
    setTime(getStatus(intoClassBlockList(x), 3, 3, ot));
  }, 500);
  onCleanup(() => {
    clearInterval(timer);
  });
  return (
    <>
      <PillCard>
        {time().left.map((it) => (
          <div>{it}</div>
        ))}
      </PillCard>
      <PillCard>
        {time().current.map((it) => (
          <div class="flex gap-1 relative">
            <div style={{}}></div>
            <div class="font-bold">{it.name}</div>
            {it.room && <div>{it.room}</div>}
            {it.teacher && <div>{it.teacher}</div>}
            <div>{blurTime(it.secs)}</div>
          </div>
        ))}
      </PillCard>
      <PillCard>
        {time().right.map((it) => (
          <div>{it}</div>
        ))}
      </PillCard>
    </>
  );
}

export default function () {
  createEffect(() => console.log(getConfig.error));
  const [getConfig] = createResource(
    async () =>
      await readTextFile("class-table/cses.json", {
        baseDir: BaseDirectory.Config,
      })
        .then(JSON.parse)
        .then((it) => Cses.parseAsync(it)),
  );
  if (getConfig.error) {
    createEffect(() => console.log(getConfig.error));
  }
  return (
    <>
      <Show when={getConfig.loading}>
        <PillCard>Loading...</PillCard>
      </Show>
      <Switch>
        <Match when={getConfig.error}>
          <PillCard>Error: {getConfig.error}</PillCard>
        </Match>
        <Match when={getConfig()}>
          <InnerCses config={getConfig()}></InnerCses>
        </Match>
      </Switch>
    </>
  );
}
