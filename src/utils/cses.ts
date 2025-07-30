import z from "zod";

export const classTime = /([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)/;
export const Class = z.object({
  subject: z.string().min(1),
  start_time: z.string().regex(classTime),
  end_time: z.string().regex(classTime),
});

export const Schedule = z.object({
  name: z.string().min(1),
  enable_day: z.number().min(1).max(7),
  weeks: z.union([z.literal("all"), z.literal("odd"), z.literal("even")]),
  classes: z.array(Class),
});

export const Subject = z.object({
  name: z.string().min(1),
  room: z.string().min(1).optional(),
  teacher: z.string().min(1).optional(),
  simplified_name: z.string().min(1).optional(),
});

export const Cses = z.object({
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
  } as const;
  const rawSchedules = config.schedules
    .reverse()
    .sort((a, b) => weeksMap[a.weeks] - weeksMap[b.weeks]);
  const subjectInfo: Record<string, SubjectInfo> = {};
  config.subjects.forEach((it) => {
    subjectInfo[it.name] = it;
  });
  const matchSchedule = (schedule: z.infer<typeof Schedule>, day: number) =>
    (schedule.weeks == "all" || schedule.weeks == (day > 6 ? "even" : "odd")) &&
    schedule.enable_day == (day % 7) + 1;
  const classToBlock = (class_: z.infer<typeof Class>, day: number) => ({
    ...class_,
    ...(subjectInfo[class_.subject] ?? {}),
    start_time: day * 86400 + matchCsesTime(class_.start_time),
    end_time: day * 86400 + matchCsesTime(class_.end_time),
    simplified_name:
      subjectInfo[class_.subject].simplified_name ??
      (class_.subject.length >= 1 ? class_.subject[0] : "课"),
  });
  return new Array(14).fill([] as ClassBlock[]).flatMap(
    (_, day) =>
      rawSchedules
        .filter((schedule) => matchSchedule(schedule, day))
        .flatMap((schedule) =>
          schedule.classes.map((class_) => classToBlock(class_, day)),
        )
        .sort((a, b) => a.start_time - b.start_time) ?? [],
  );
}
