import { z } from "zod";

export const Time = z.object({
  name: z.literal("time"),
  style: z.enum(["datetime", "dateShortTime", "date", "time", "shortTime"]),
});

export const CompletedCourses = z.object({
  name: z.literal("completedCourses"),
  bySchedule: z.string(),
  length: z.number().min(1),
  mode: z.enum(["long", "short"]),
  crossDay: z.boolean(),
});
export const OngoingCourses = z.object({
  name: z.literal("ongoingCourses"),
  bySchedule: z.string(),
  blur: z.boolean(),
});
export const UpcomingCourses = z.object({
  name: z.literal("upcomingCourses"),
  bySchedule: z.string(),
  length: z.number().min(1),
  mode: z.enum(["long", "short"]),
  crossDay: z.boolean(),
});

export const PluginUnion = z.union([
  Time,
  CompletedCourses,
  OngoingCourses,
  UpcomingCourses,
]);
export const PluginArray = z.array(PluginUnion);

export const CsesSetting = z.object({
  like: z.literal("cses"),
  file: z.string(),
  start: z.iso.date(),
});

// TODO: muti like
export const ScheduleUnion = z.union([CsesSetting]);

export const Settings = z.object({
  inputs: z.object({
    schedules: z.record(z.string(), ScheduleUnion),
  }),
  positionPx: z.object({
    width: z.number(),
    marginTop: z.number(),
    marginBottom: z.number(),
    exclusiveZone: z.number(),
  }),
  layout: z.object({
    left: PluginArray,
    middle: PluginArray,
    right: PluginArray,
  }),
});

export default Settings;
