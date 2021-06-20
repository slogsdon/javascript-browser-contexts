export interface NewWindowMessageData {
  id?: string;
  origin?: string;
}

export interface WindowOptions {
  isPopup?: boolean;
  id?: string;
  width?: number;
  height?: number;
  showMenuBar?: boolean;
  showLocation?: boolean;
  isResizable?: boolean;
  showScrollBars?: boolean;
  showStatusBar?: boolean;
  hide?: boolean;
  origin?: string;
}
