export type ResponseType =
  | "mathematics"
  | "physics"
  | "chemistry"
  | "programming"
  | "general";

export type StepData = {
  number: number;
  title: string;
  explanation: string;
  equations?: string[];
};

export type KeyValue = {
  label: string;
  value: string;
};

export type GraphData = {
  enabled: boolean;
  type?: string;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  data?: Array<[number, number]>;
};

export type VerificationItem = {
  label: string;
  ok: boolean;
  detail?: string;
};

export type DiagramNode = {
  label: string;
  x: number;
  y: number;
  dx?: number;
  dy?: number;
  type?: "force" | "axis" | "object" | "vector";
};

export type DiagramData = {
  title?: string;
  description?: string;
  nodes?: DiagramNode[];
};

export type ResponseData = {
  type: ResponseType;
  question: string;
  summary?: string;
  steps?: StepData[];
  given?: KeyValue[];
  find?: string[];
  keyValues?: KeyValue[];
  graph?: GraphData;
  verification?: VerificationItem[];
  finalAnswer?: string;
  concept?: string;
  explanation?: string;
  code?: string;
  codeLanguage?: string;
  diagram?: DiagramData;
};
