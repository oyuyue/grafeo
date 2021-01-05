export interface App {
  mount?: (el?: string | Element) => void;
  update?: (opts?: any) => void;
  destroy?: () => void;
}

export type AppEntry = (opts: any, isRoot?: boolean) => Required<App>
