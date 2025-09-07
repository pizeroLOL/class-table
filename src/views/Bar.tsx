import { BaseDirectory, readTextFile } from "@tauri-apps/plugin-fs";
import {
  createEffect,
  createResource,
  JSX,
  Match,
  Resource,
  Switch,
} from "solid-js";
import z from "zod";
import PillCard from "../components/PillCard";
import Completed from "../components/scheduleBlock/Completed.tsx";
import Ongoing from "../components/scheduleBlock/Ongoing.tsx";
import Upcoming from "../components/scheduleBlock/Upcoming.tsx";
import TimeBlock from "../components/TimeBlock.tsx";
import "../styles/Bar.css";
import { Cses, intoClassBlockList } from "../utils/cses.ts";
import Settings, {
  CompletedCourses,
  OngoingCourses,
  PluginUnion,
  ScheduleUnion,
  Time,
  UpcomingCourses,
  XiaomiWeather,
} from "../utils/settings";
import Xiaomi from "../components/weatherBlock/Xiaomi.tsx";

function scheduleLayoutToResouce(
  settings: z.infer<typeof Settings>,
  layout: z.infer<typeof PluginUnion>[][],
) {
  const scheduleList = layout
    .flat()
    .filter(
      (it) =>
        it.name == "completedCourses" ||
        it.name == "ongoingCourses" ||
        it.name == "upcomingCourses",
    )
    .map((it) => it.bySchedule);
  const scheduleSet = Array.from(new Set(scheduleList))
    .map(
      (id) =>
        [id, settings.inputs.schedules[id]] as [
          string,
          z.infer<typeof ScheduleUnion>,
        ],
    )
    .filter(([_id, schedule]) => schedule !== undefined)
    .map(([id, schedule]) => {
      const x = createResource(() =>
        readTextFile(schedule.file, { baseDir: BaseDirectory.AppConfig })
          .then(JSON.parse)
          .then(Cses.parseAsync)
          .then(intoClassBlockList),
      )[0];
      return [id, x] as [string, Resource<ClassBlock[]>];
    });
  return Object.fromEntries(scheduleSet) as Record<
    string,
    Resource<ClassBlock[]>
  >;
}

function matcher(
  option: z.infer<typeof PluginUnion>,
  schedules: Record<string, Resource<ClassBlock[]>>,
  settings: z.infer<typeof Settings>,
) {
  const map = {
    time: (option: z.infer<typeof Time>, _settings: z.infer<typeof Settings>) =>
      TimeBlock(option),
    completedCourses: (
      option: z.infer<typeof CompletedCourses>,
      _settings: z.infer<typeof Settings>,
    ) => (
      <Switch>
        <Match when={schedules[option.bySchedule].loading}>
          <PillCard>Loading Config ...</PillCard>
        </Match>
        <Match when={schedules[option.bySchedule].error}>
          <PillCard>Error: {schedules[option.bySchedule].error}</PillCard>
        </Match>
        <Match when={schedules[option.bySchedule]()}>
          <Completed
            schedule={schedules[option.bySchedule]() ?? []}
            rawStart={
              new Date(settings.inputs.schedules[option.bySchedule].start)
            }
            option={option}
          ></Completed>
        </Match>
      </Switch>
    ),
    ongoingCourses: (
      option: z.infer<typeof OngoingCourses>,
      _settings: z.infer<typeof Settings>,
    ) => (
      <Switch>
        <Match when={schedules[option.bySchedule].loading}>
          <PillCard>Loading Config ...</PillCard>
        </Match>
        <Match when={schedules[option.bySchedule].error}>
          <PillCard>Error: {schedules[option.bySchedule].error}</PillCard>
        </Match>
        <Match when={schedules[option.bySchedule]()}>
          <Ongoing
            schedule={schedules[option.bySchedule]() ?? []}
            rawStart={
              new Date(settings.inputs.schedules[option.bySchedule].start)
            }
            option={option}
          ></Ongoing>
        </Match>
      </Switch>
    ),
    upcomingCourses: (
      option: z.infer<typeof UpcomingCourses>,
      _settings: z.infer<typeof Settings>,
    ) => (
      <Switch>
        <Match when={schedules[option.bySchedule].loading}>
          <PillCard>Loading Config ...</PillCard>
        </Match>
        <Match when={schedules[option.bySchedule].error}>
          <PillCard>Error: {schedules[option.bySchedule].error}</PillCard>
        </Match>
        <Match when={schedules[option.bySchedule]()}>
          <Upcoming
            schedule={schedules[option.bySchedule]() ?? []}
            rawStart={
              new Date(settings.inputs.schedules[option.bySchedule].start)
            }
            option={option}
          ></Upcoming>
        </Match>
      </Switch>
    ),
    xiaomiWeather: (
      option: z.infer<typeof XiaomiWeather>,
      _settings: z.infer<typeof Settings>,
    ) => Xiaomi(option),
  } as Record<
    z.infer<typeof PluginUnion>["name"],
    (
      option: z.infer<typeof PluginUnion>,
      settings: z.infer<typeof Settings>,
    ) => JSX.Element
  >;
  return map[option.name](option, settings);
}

function ToPlace(props: { settings?: z.infer<typeof Settings> }) {
  const settings = props.settings;
  if (!settings) {
    return <PillCard>No settings</PillCard>;
  }
  const rawLayout = [settings.layout.left]
    .concat([settings.layout.middle])
    .concat([settings.layout.right]);
  const schedules = scheduleLayoutToResouce(settings, rawLayout);
  const layout = rawLayout.map((it) =>
    it
      .filter(
        (it) =>
          ((it.name == "completedCourses" ||
            it.name == "ongoingCourses" ||
            it.name == "upcomingCourses") &&
            schedules[it.bySchedule] != undefined) ||
          (it.name != "completedCourses" &&
            it.name != "ongoingCourses" &&
            it.name != "upcomingCourses"),
      )
      .map((it) => matcher(it, schedules, settings)),
  );
  return (
    <>
      <div class="flex gap-2 justify-start">{layout[0]}</div>
      <div class="flex gap-2 justify-center">{layout[1]}</div>
      <div class="flex gap-2 justify-end">{layout[2]}</div>
    </>
  );
}

function App() {
  const [settings] = createResource(() =>
    readTextFile("settings.json", { baseDir: BaseDirectory.AppConfig })
      .then(JSON.parse)
      .then(Settings.parseAsync),
  );
  createEffect(() => {
    if (settings.error) {
      console.error(settings.error);
    }
  });
  return (
    <main class="font-normal font-sans gap-2 h-dvh grid grid-cols-3 justify-stretch items-center">
      <Switch>
        <Match when={settings.loading}>
          <PillCard>Loading...</PillCard>
        </Match>
        <Match when={settings.error}>
          <PillCard>Error: {settings.error}</PillCard>
        </Match>
        <Match when={settings()}>
          <ToPlace settings={settings()} />
        </Match>
      </Switch>
    </main>
  );
}

export default App;
