import Demo from "~/features/home/Demo.mdx";
import Intro from "~/features/home/Intro.mdx";
import WhenNot from "~/features/home/WhenNot.mdx";
import Why from "~/features/home/Why";
import { RightColumnLayout } from "~/features/layouts/RightColumnLayout";

export const headers = () => {
  return {
    "Cache-Control": "max-age=300, s-maxage=3600",
  };
};

export const meta = () => {
  return {
    title: "RefinerDB",
    description:
      "RefinerDB is a javascript library that greatly simplifies creating advanced search solutions without requiring an additional backend data store.",
  };
};

export default function HomePage() {
  return (
    <>
      <h1 className="font-mono text-7xl ">RefinerDB</h1>
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
