import { Link } from "@remix-run/react";

interface RightColumnLayoutProps {
  children: React.ReactNode;
  sidebarLinks: {
    title: string;
    to: string;
  }[];
}

export function RightColumnLayout({
  children,
  sidebarLinks,
}: RightColumnLayoutProps) {
  return (
    <div className="grid grid-cols-12 gap-3">
      <div className="max-w-3xl col-span-10">{children}</div>
      <div className="col-span-2">
        <ul className="sticky top-0 pt-4 list-none">
          {sidebarLinks.map((link) => (
            <li key={link.to + link.title} className="flex flex-col list-none">
              <Link to={link.to} className="py-1 no-underline link">
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
