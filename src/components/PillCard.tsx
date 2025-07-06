import { children, JSXElement } from "solid-js";

export default (props?: { children?: JSXElement[] | JSXElement }) => {
  const items = children(() => props?.children);
  return (
    <div class="flex gap-2 px-2 rounded-full items-center content-center justify-center bg-stone-300 overflow-hidden">
      {items()}
    </div>
  );
};
