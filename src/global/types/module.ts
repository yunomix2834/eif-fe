export type AppModuleDefinition = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  href: string;
  status: "available" | "beta" | "disabled";
};
