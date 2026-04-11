export type FanChartPerson = {
  id: string;
  fullName: string;
  lifeLabel: string;
  children: FanChartPerson[];
};

export type FanChartLayoutNode = {
  person: FanChartPerson;
  depth: number;
  angleStart: number;
  angleEnd: number;
  branchIndex: number;
};
