import { children, JSXElement } from "solid-js";

export default (props?: { children?: JSXElement[] | JSXElement }) => {
  const items = children(() => props?.children);
  return <div class="pill bg-stone-300 overflow-hidden">{items()}</div>;
};
