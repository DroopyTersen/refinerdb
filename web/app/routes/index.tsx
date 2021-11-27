import Demo from "~/features/home/Demo.mdx";
import Intro from "~/features/home/Intro.mdx";
import WhenNot from "~/features/home/WhenNot.mdx";
import Why from "~/features/home/Why";
import { RightColumnLayout } from "~/features/layouts/RightColumnLayout";

export default function HomePage() {
  return (
    <>
      <h1>RefinerDB</h1>
      <RightColumnLayout
        sidebarLinks={[
          { title: "What is it?", to: "#" },
          { title: "Code Example", to: "#code-example" },
          { title: "Why RefinerDB?", to: "#why" },
          { title: "When is it not a fit?", to: "#not-a-fit" },
          { title: "Editable Demo", to: "#demo" },
        ]}
      >
        <Intro />
        <Why />
        <WhenNot />
      </RightColumnLayout>
      <Demo />
    </>
  );
}
