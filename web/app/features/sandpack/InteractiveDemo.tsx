import { Sandpack } from "@codesandbox/sandpack-react";
import useAsyncData from "~/hooks/useAsyncData";

const fetchDemo = async (slug) => {
  return fetch("/demos/" + slug).then((res) => res.json());
};
export default function InteractiveDemo({ slug = "" }) {
  let { data } = useAsyncData(fetchDemo, [slug], null);
  console.log("🚀 | InteractiveDemo | data", data);

  if (!data) {
    return null;
  }

  return (
    <Sandpack
      {...data.demo}
      options={{
        editorHeight: 700,
        showLineNumbers: true,
        showInlineErrors: true,
      }}
      theme="monokai-pro"
    />
  );
}
