import z from "zod";

export const CurrentXiaomiWeather = z.object({
  current: z.object({
    temperature: z.object({
      unit: z.string(),
      value: z.string(),
    }),
  }),
});
