export interface SandpackFile {
  hidden?: boolean;
  active?: boolean;
  code: string;
}

export interface DemoConfig {
  files: {
    [path: string]: SandpackFile;
  };
  template: "vanilla-ts" | "react-ts";
  customSetup?: {
    dependencies?: {
      [name: string]: string;
    };
    entry?: string;
  };
}

export interface AllDemos {
  [slug: string]: DemoConfig;
}
