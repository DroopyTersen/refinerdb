import { Sandpack } from "@codesandbox/sandpack-react";
import useAsyncData from "~/hooks/useAsyncData";

let allDemos: any = null;
const fetchDemo = async (slug) => {
  if (!allDemos) {
    allDemos = await fetch("/generated/demos.json").then((resp) => resp.json());
  }
  console.log(allDemos, slug);
  return allDemos?.[slug];
};
export default function InteractiveDemo({ slug = "" }) {
  let { data } = useAsyncData(fetchDemo, [slug], null);
  console.log("🚀 | InteractiveDemo | data", data);

  if (!data) {
    return null;
  }

  return (
    <Sandpack
      {...data}
      options={{
        editorHeight: 700,
        showLineNumbers: true,
        showInlineErrors: true,
      }}
      theme="monokai-pro"
    />
  );
}
