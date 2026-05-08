export interface FormSchema {
  formConfig: FormConfig;
  widgetList: Widget[];
}

export interface FormConfig {
  onFormCreated?: string;
  functions?: string;
  gridResponsive?: boolean;
  labelWidth?: number;
  onFormUnmounted?: string;
  actionRules?: any[];
  labelPosition?: 'left' | 'right' | 'top';
  mobileLabelAlign?: string;
  onFormValidate?: string;
  onFormMounted?: string;
  layoutType?: string;
  jsonVersion?: number;
  refName?: string;
  dashboardGridRowHeight?: number;
  dataSources?: DataSource[];
  onAfterSetFormData?: string;
  cssCode?: string;
  calculateFormulaAfterSetFormData?: boolean;
  modelName?: string;
  rulesName?: string;
  size?: string;
  labelAlign?: string;
  onFormDataChange?: string;
  customClass?: string[];
  mobileLabelPosition?: string;
  h5LabelTop?: boolean;
}

export interface DataSource {
  requestURLType?: string;
  headers?: { name: string; type: string; value: string }[];
  configHandlerCode?: string;
  data?: any[];
  dataSetEnabled?: boolean;
  requestMethod?: string;
  description?: string;
  params?: any[];
  dataSourceId?: string;
  uniqueName?: string;
  requestURL?: string;
  dataSets?: any[];
  errorHandlerCode?: string;
  dataHandlerCode?: string;
}

export interface Widget {
  icon?: string;
  options: WidgetOptions;
  alias?: string;
  id: string;
  type: string;
  key: number;
  formItemFlag: boolean;
}

export interface WidgetOptions {
  onClick?: string;
  defaultValue?: any;
  minLength?: number | null;
  labelWidth?: number | null;
  type?: string;
  required?: boolean;
  appendButtonDisabled?: boolean;
  textForAppend?: string;
  displayStyle?: string;
  buttonIcon?: string;
  readonly?: boolean;
  labelTooltip?: string | null;
  labelWrap?: boolean;
  plain?: boolean;
  showWordLimit?: boolean;
  appendButton?: boolean;
  labelIconClass?: string | null;
  appendText?: boolean;
  validation?: string;
  requiredHint?: string;
  onMounted?: string;
  onChange?: string;
  format?: string;
  labelIconPosition?: string;
  onFocus?: string;
  onEnterKeyup?: string;
  size?: string;
  name: string;
  circle?: boolean;
  prefixIcon?: string;
  maxLength?: number | null;
  hidden?: boolean;
  icon?: string | null;
  suffixIcon?: string;
  startPlaceholder?: string;
  columnWidth?: string;
  disabled?: boolean;
  placeholder?: string;
  endPlaceholder?: string;
  autoFullWidth?: boolean;
  clearable?: boolean;
  editable?: boolean;
  keyName?: string;
  valueFormat?: string;
  onInput?: string;
  label: string;
  validationHint?: string;
  onBlur?: string;
  onAppendButtonClick?: string;
  labelHidden?: boolean;
  round?: boolean;
  labelAlign?: string;
  onValidate?: string;
  keyNameEnabled?: boolean;
  customClass?: string | string[] | null;
  showPassword?: boolean;
  onCreated?: string;
  switchWidth?: number;
  activeText?: string;
  inactiveText?: string;
  inactiveColor?: string | null;
  activeColor?: string | null;
  remote?: boolean;
  dsEnabled?: boolean;
  dsName?: string;
  dataSetName?: string;
  multipleLimit?: number;
  optionItems?: OptionItem[];
  optionValueType?: string;
  collapseTags?: boolean;
  automaticDropdown?: boolean;
  valueKey?: string;
  multiple?: boolean;
  labelKey?: string;
  border?: boolean;
  buttonStyle?: boolean;
  firstOptionAsDefault?: boolean;
  showText?: boolean;
  showScore?: boolean;
  max?: number;
  lowThreshold?: number;
  highThreshold?: number;
  allowHalf?: boolean;
  range?: boolean;
  showStops?: boolean;
  min?: number;
  height?: number | null;
  step?: number;
  htmlContent?: string;
  textAlign?: string;
  textContent?: string;
  fontStyle?: string;
  preWrap?: boolean;
  fontSize?: string;
  fontWeight?: string;
}

export interface OptionItem {
  label: string;
  value: string | number;
}

export interface FormConfigRecord {
  id: string;
  name: string;
  config: FormSchema;
  created_at: string;
  updated_at: string;
}

export interface FormSubmissionRecord {
  id: string;
  config_id: string;
  data: Record<string, any>;
  submitted_at: string;
}
