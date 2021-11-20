import * as React from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
import "@codesandbox/sandpack-react/dist/index.css";

export default function InteractiveEditor() {
  let [shouldRender, setShouldRender] = React.useState(false);
  React.useEffect(() => {
    setShouldRender(true);
  }, []);
  return (
    <div className="interactive-editor">{shouldRender && <InnerEditor />}</div>
  );
}

function InnerEditor() {
  // return <div>Hello</div>;
  return <Sandpack template="react" />;
}
