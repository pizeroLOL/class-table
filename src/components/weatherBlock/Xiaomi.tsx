import { fetch } from "@tauri-apps/plugin-http";
import { createSignal, onCleanup } from "solid-js";
import z from "zod";
import { XiaomiWeather } from "../../utils/settings";
import { CurrentXiaomiWeather } from "../../utils/weather";
import PillCard from "../PillCard";

const halfHourMs = 30 * 60 * 1000;
const getUrl = (districtId: number) =>
  `https://weatherapi.market.xiaomi.com/wtr-v3/weather/all?latitude=0&longitude=0&locationKey=weathercn:${districtId}&appKey=weather20151024&sign=zUFJoAR2ZVrDy1vF3D07&isGlobal=false&locale=zh_cn&days=1`;

const fetchData = (districtId: number) =>
  fetch(getUrl(districtId))
    .then((it) => it.json())
    .then(CurrentXiaomiWeather.safeParseAsync)
    .then((it) => {
      if (!it.data || it.error) {
        console.error(`获取天气错误：
        城市：${districtId}
        错误：${it.error}`);
        return "天气获取错误";
      }
      const currentTemperature = it.data.current.temperature;
      return `${currentTemperature.value}${currentTemperature.unit}`;
    });

export default (props: z.infer<typeof XiaomiWeather>) => {
  const [getter, setter] = createSignal("天气加载中");
  fetchData(props.districtId).then(setter);
  const timer = setInterval(
    () => fetchData(props.districtId).then(setter),
    halfHourMs,
  );
  onCleanup(() => clearInterval(timer));
  return (
    <PillCard>
      {props.districtName} {getter()}
    </PillCard>
  );
};
