// export function getStatus(
//   blocks: ClassBlock[],
//   left: number,
//   right: number,
//   offset_time: number,
// ): CountDown {
//   const rawLeftStatus = blocks
//     .filter((block) => block.end_time < offset_time)
//     .slice(-left)
//     .map((it) => it.simplified_name);
//   const leftStatus =
//     rawLeftStatus.length == left || blocks.length < left
//       ? rawLeftStatus
//       : blocks
//           .slice(rawLeftStatus.length - left)
//           .map((it) => it.subject)
//           .concat(rawLeftStatus);
//   const rawRightStatus = blocks
//     .filter((block) => offset_time <= block.start_time)
//     .slice(0, right)
//     .map((it) => it.simplified_name);
//   const rightStatus =
//     rawRightStatus.length == right || blocks.length < right
//       ? rawRightStatus
//       : rawRightStatus.concat(
//           blocks
//             .slice(0, right - rawRightStatus.length)
//             .map((it) => it.subject),
//         );
//   const rawCurrentStatus = blocks
//     .filter((it) => it.start_time <= offset_time && offset_time < it.end_time)
//     .map(
//       (it) =>
//         ({
//           ...it,
//           name: it.subject,
//           secs: it.end_time - offset_time,
//         }) as CurrentClass,
//     );
//   const nextClassStart = blocks.find(
//     (it) => it.start_time > offset_time,
//   )?.start_time;
//   const currentStatus =
//     rawCurrentStatus.length >= 1
//       ? rawCurrentStatus
//       : ([
//           {
//             end_time:
//               nextClassStart ??
//               (blocks.length == 0
//                 ? Infinity
//                 : 14 * 24 * 60 * 60 +
//                   blocks[0].start_time -
//                   blocks[blocks.length].end_time),
//             name: "下课",
//             secs:
//               nextClassStart !== undefined
//                 ? nextClassStart - offset_time
//                 : blocks.length == 0
//                   ? Infinity
//                   : 14 * 24 * 60 * 60 - offset_time + blocks[0].start_time,
//           },
//         ] as CurrentClass[]);
//   return {
//     left: leftStatus,
//     current: currentStatus,
//     right: rightStatus,
//   };
// }

export const dayMs = 24 * 60 * 60 * 1000;
export const mondayMap = [6, 0, 1, 2, 3, 4, 5];

// export default function InnerCses(props: { config?: z.infer<typeof Cses> }) {
//   const x = props.config;
//   if (!x) {
//     return <PillCard>no config</PillCard>;
//   }
//   const rawStart = new Date(2025, 6, 1);
//   const start =
//     rawStart.setHours(0, 0, 0, 0) - mondayMap[rawStart.getDay()] * dayMs;
//   const [time, setTime] = createSignal({
//     left: [],
//     current: [],
//     right: [],
//   } as CountDown);
//   const timer = setInterval(() => {
//     const ot = Math.floor(((Date.now() - start) % (14 * dayMs)) / 1000);
//     setTime(getStatus(intoClassBlockList(x), 3, 3, ot));
//   }, 500);
//   onCleanup(() => {
//     clearInterval(timer);
//   });
//   return (
//     <>
//       <PillCard>
//         {time().left.map((it) => (
//           <div>{it}</div>
//         ))}
//       </PillCard>
//       <PillCard>
//         {time().current.map((it) => (
//           <div class="flex gap-1">
//             <div class="font-bold">{it.name}</div>
//             {it.room && <div>{it.room}</div>}
//             {it.teacher && <div>{it.teacher}</div>}
//             <div>{blurTime(it.secs)}</div>
//           </div>
//         ))}
//       </PillCard>
//       <PillCard>
//         {time().right.map((it) => (
//           <div>{it}</div>
//         ))}
//       </PillCard>
//     </>
//   );
// }

// export default function () {
//   createEffect(() => console.log(getConfig.error));
//   const [getConfig] = createResource(
//     async () =>
//       await readTextFile("class-table/cses.json", {
//         baseDir: BaseDirectory.Config,
//       })
//         .then(JSON.parse)
//         .then((it) => Cses.parseAsync(it)),
//   );
//   if (getConfig.error) {
//     createEffect(() => console.log(getConfig.error));
//   }
//   return (
//     <>
//       <Show when={getConfig.loading}>
//         <PillCard>Loading...</PillCard>
//       </Show>
//       <Switch>
//         <Match when={getConfig.error}>
//           <PillCard>Error: {getConfig.error}</PillCard>
//         </Match>
//         <Match when={getConfig()}>
//           <InnerCses config={getConfig()}></InnerCses>
//         </Match>
//       </Switch>
//     </>
//   );
// }
