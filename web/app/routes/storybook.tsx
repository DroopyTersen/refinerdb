import { redirect } from "remix";

export const loader = () => {
  return redirect("/_storybook/index.html");
};
