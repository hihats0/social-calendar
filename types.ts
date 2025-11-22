export interface Birthday {
  id: string;
  name: string;
  handle: string;
  monthIndex: number; // 0-11
  dayIndex: number; // 1-31
}

export interface MonthConfig {
  name: string;
  days: number;
  color: string;
  headerColor: string;
}
