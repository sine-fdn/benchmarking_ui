export interface FunctionDeclaration {
  id: string;
  inputs: string[];
  outputs: string[];
  inputMatrix: number[][];
}

export interface Dataset {
  id: string;
  dimensions: DatasetDimension[];
}

export interface DatasetDimension {
  id: string;
  integerValues: number[];
}

export interface ImportData {
  datasets: Dataset[];
  functions: FunctionDeclaration[];
}
