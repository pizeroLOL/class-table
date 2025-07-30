export const day = 24 * 60 * 60;
export const blurTime = (sec: number) => {
  if (sec < 30) return `< 30s`;
  if (sec < 60) return `< 30s`;
  if (sec < 60 * 60) return `< ${Math.floor(sec / 60) + 1}m`;
  if (sec < day) return `< ${Math.floor(sec / 60 / 60) + 1}h`;
  return `< ${Math.floor(sec / day) + 1}d`;
};

const floorPad = (num: number) => Math.floor(num).toString().padStart(2, "0");

export const time = (sec: number) =>
  sec > day
    ? `${Math.floor(sec / day)}d ${floorPad(sec / 3600)}:${floorPad((sec / 60) % 60)}:${floorPad(sec % 60)}`
    : sec > 3600
      ? `${floorPad(sec / 3600)}:${floorPad((sec / 60) % 60)}:${floorPad(sec % 60)}`
      : `${floorPad((sec / 60) % 60)}:${floorPad(sec % 60)}`;
