import { useMemo } from "react";

type BreakpointColumns = {
  base?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
};

const GRID_CLASS_MAP: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
};

const BREAKPOINTS: Array<keyof BreakpointColumns> = [
  "base",
  "sm",
  "md",
  "lg",
  "xl",
];

const PREFIX_MAP: Record<keyof BreakpointColumns, string> = {
  base: "",
  sm: "sm:",
  md: "md:",
  lg: "lg:",
  xl: "xl:",
};

export const useResponsiveGrid = (
  columns: BreakpointColumns = { base: 1, sm: 2, md: 3, lg: 4, xl: 5 }
) =>
  useMemo(() => {
    const classes = ["grid gap-4 lg:gap-5"];

    BREAKPOINTS.forEach((breakpoint) => {
      const value = columns[breakpoint];
      if (!value) {
        return;
      }

      const gridClass = GRID_CLASS_MAP[value];
      if (!gridClass) {
        return;
      }

      classes.push(`${PREFIX_MAP[breakpoint]}${gridClass}`);
    });

    return classes.join(" ");
  }, [columns]);
