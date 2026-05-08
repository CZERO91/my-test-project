import React, { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { FormSchema, Widget, WidgetOptions } from '../types/schema';

export interface FormRendererRef {
  getFormData: () => Promise<Record<string, any>>;
  setFormData: (formData: Record<string, any>) => void;
  resetForm: () => void;
  validate: () => Promise<{ valid: boolean; errorFields: Record<string, string> }>;
  clearValidate: () => void;
  getFieldWidgets: () => Widget[];
  setFormJson: (schema: FormSchema) => void;
}

interface FormRendererProps {
  schema: FormSchema;
  formData?: Record<string, any>;
  optionData?: Record<string, any>;
  globalDsv?: Record<string, any>;
  onSubmit?: (data: Record<string, any>) => void;
  onReset?: () => void;
  onFormDataChange?: (data: Record<string, any>) => void;
  onValidate?: (valid: boolean, errorFields: Record<string, string>) => void;
  readOnly?: boolean;
}

const InputWidget: React.FC<{
  options: WidgetOptions;
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}> = ({ options, value, onChange, onBlur, onFocus }) => {
  const inputType = options.type === 'number' ? 'number' : options.type === 'password' ? 'password' : 'text';
  
  return (
    <div className="relative">
      {options.prefixIcon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-slate-400 text-sm">{options.prefixIcon}</span>
        </div>
      )}
      <input
        type={inputType}
        name={options.name}
        value={value ?? options.defaultValue ?? ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={options.placeholder || '请输入'}
        disabled={options.disabled}
        readOnly={options.readonly}
        maxLength={options.maxLength ?? undefined}
        minLength={options.minLength ?? undefined}
        className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 
          disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500
          hover:border-slate-300 ${options.prefixIcon ? 'pl-10' : ''} ${options.suffixIcon ? 'pr-10' : ''}`}
      />
      {options.suffixIcon && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-slate-400 text-sm">{options.suffixIcon}</span>
        </div>
      )}
    </div>
  );
};

const DateWidget: React.FC<{
  options: WidgetOptions;
  value: any;
  onChange: (value: any) => void;
}> = ({ options, value, onChange }) => {
  return (
    <div className="relative">
      <input
        type={options.type === 'week' ? 'week' : options.type === 'month' ? 'month' : options.type === 'year' ? 'number' : 'date'}
        name={options.name}
        value={value ?? options.defaultValue ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={options.disabled}
        readOnly={options.readonly}
        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 
          disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500
          hover:border-slate-300"
      />
    </div>
  );
};

const SelectWidget: React.FC<{
  options: WidgetOptions;
  value: any;
  optionData?: Record<string, any>;
  onChange: (value: any) => void;
}> = ({ options, value, optionData, onChange }) => {
  const dataSourceName = options.dsEnabled ? options.dsName : null;
  const optionItems = dataSourceName && optionData?.[dataSourceName] 
    ? optionData[dataSourceName] 
    : options.optionItems || [];
  
  const currentValue = options.multiple 
    ? (Array.isArray(value) ? value : (Array.isArray(options.defaultValue) ? options.defaultValue : []))
    : (value ?? options.defaultValue ?? '');
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (options.multiple) {
      const selectedOptions = Array.from(e.target.selectedOptions).map(opt => opt.value);
      onChange(selectedOptions);
    } else {
      onChange(e.target.value);
    }
  };
  
  return (
    <div className="relative">
      <select
        name={options.name}
        value={currentValue}
        onChange={handleChange}
        disabled={options.disabled}
        multiple={options.multiple}
        className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 
          disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500
          hover:border-slate-300 ${options.multiple ? 'min-h-[80px]' : ''}`}
      >
        {!options.multiple && <option value="">请选择</option>}
        {optionItems.map((item: any, index: number) => (
          <option key={index} value={item[options.valueKey || 'value']}>
            {item[options.labelKey || 'label']}
          </option>
        ))}
      </select>
      {options.clearable && !options.multiple && currentValue && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onChange(''); }}
          className="absolute inset-y-0 right-8 flex items-center px-2 text-slate-400 hover:text-slate-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

const RadioWidget: React.FC<{
  options: WidgetOptions;
  value: any;
  optionData?: Record<string, any>;
  onChange: (value: any) => void;
}> = ({ options, value, optionData, onChange }) => {
  const dataSourceName = options.dsEnabled ? options.dsName : null;
  const optionItems = dataSourceName && optionData?.[dataSourceName]
    ? optionData[dataSourceName]
    : options.optionItems || [];
  const displayStyle = options.displayStyle || 'inline';
  const currentValue = value ?? options.defaultValue;
  
  return (
    <div className={`flex ${displayStyle === 'inline' ? 'flex-row flex-wrap gap-4' : 'flex-col gap-2'}`}>
      {optionItems.map((item: any, index: number) => (
        <label 
          key={index} 
          className={`flex items-center gap-2 cursor-pointer group transition-all duration-200 ${
            options.disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200
            ${currentValue === item[options.valueKey || 'value'] 
              ? 'border-blue-500' 
              : 'border-slate-300 group-hover:border-slate-400'
            }`}>
            {currentValue === item[options.valueKey || 'value'] && (
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            )}
          </span>
          <input
            type="radio"
            name={options.name}
            value={item[options.valueKey || 'value']}
            checked={currentValue === item[options.valueKey || 'value']}
            onChange={() => !options.disabled && onChange(item[options.valueKey || 'value'])}
            disabled={options.disabled}
            className="sr-only"
          />
          <span className="text-slate-700 group-hover:text-slate-900 transition-colors">
            {item[options.labelKey || 'label']}
          </span>
        </label>
      ))}
    </div>
  );
};

const CheckboxWidget: React.FC<{
  options: WidgetOptions;
  value: any[];
  optionData?: Record<string, any>;
  onChange: (value: any[]) => void;
}> = ({ options, value, optionData, onChange }) => {
  const dataSourceName = options.dsEnabled ? options.dsName : null;
  const optionItems = dataSourceName && optionData?.[dataSourceName]
    ? optionData[dataSourceName]
    : options.optionItems || [];
  const displayStyle = options.displayStyle || 'inline';
  const currentValue = Array.isArray(value) ? value : (Array.isArray(options.defaultValue) ? options.defaultValue : []);
  
  const handleChange = (itemValue: any, checked: boolean) => {
    if (checked) {
      onChange([...currentValue, itemValue]);
    } else {
      onChange(currentValue.filter(v => v !== itemValue));
    }
  };
  
  return (
    <div className={`flex ${displayStyle === 'inline' ? 'flex-row flex-wrap gap-4' : 'flex-col gap-2'}`}>
      {optionItems.map((item: any, index: number) => {
        const itemValue = item[options.valueKey || 'value'];
        const isChecked = currentValue.includes(itemValue);
        return (
          <label 
            key={index} 
            className={`flex items-center gap-2 cursor-pointer group transition-all duration-200 ${
              options.disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200
              ${isChecked 
                ? 'bg-blue-500 border-blue-500' 
                : 'border-slate-300 group-hover:border-slate-400'
              }`}>
              {isChecked && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            <input
              type="checkbox"
              value={itemValue}
              checked={isChecked}
              onChange={(e) => handleChange(itemValue, e.target.checked)}
              disabled={options.disabled}
              className="sr-only"
            />
            <span className="text-slate-700 group-hover:text-slate-900 transition-colors">
              {item[options.labelKey || 'label']}
            </span>
          </label>
        );
      })}
    </div>
  );
};

const SwitchWidget: React.FC<{
  options: WidgetOptions;
  value: boolean;
  onChange: (value: boolean) => void;
}> = ({ options, value, onChange }) => {
  const currentValue = value ?? options.defaultValue ?? false;
  
  return (
    <button
      type="button"
      role="switch"
      aria-checked={currentValue}
      onClick={() => !options.disabled && onChange(!currentValue)}
      disabled={options.disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-out 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${currentValue ? 'bg-blue-500' : 'bg-slate-300'}
        ${options.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
      style={{ width: options.switchWidth ? options.switchWidth + 16 : 44 }}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-300 ease-out ${
          currentValue ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

const RateWidget: React.FC<{
  options: WidgetOptions;
  value: number;
  onChange: (value: number) => void;
}> = ({ options, value, onChange }) => {
  const max = options.max || 5;
  const currentValue = value ?? options.defaultValue ?? 0;
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  
  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => {
        const filled = (hoverValue ?? currentValue) >= star;
        return (
          <button
            key={star}
            type="button"
            onClick={() => !options.disabled && onChange(star)}
            onMouseEnter={() => !options.disabled && setHoverValue(star)}
            onMouseLeave={() => setHoverValue(null)}
            disabled={options.disabled}
            className={`focus:outline-none transition-transform hover:scale-110 ${options.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <svg
              className={`w-6 h-6 transition-colors duration-150 ${
                filled ? 'text-yellow-400' : 'text-slate-300'
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
      {(options.showScore || options.showText) && (
        <span className="ml-2 text-sm text-slate-600 font-medium">
          {hoverValue ?? currentValue} / {max}
        </span>
      )}
    </div>
  );
};

const DateRangeWidget: React.FC<{
  options: WidgetOptions;
  value: [string, string] | null;
  onChange: (value: [string, string] | null) => void;
}> = ({ options, value, onChange }) => {
  const currentValue = value || options.defaultValue || null;
  
  const handleStartChange = (date: string) => {
    if (currentValue) {
      onChange([date, currentValue[1]]);
    } else {
      onChange([date, '']);
    }
  };
  
  const handleEndChange = (date: string) => {
    if (currentValue) {
      onChange([currentValue[0], date]);
    } else {
      onChange(['', date]);
    }
  };
  
  return (
    <div className="flex items-center gap-3">
      <input
        type="date"
        value={currentValue?.[0] || ''}
        onChange={(e) => handleStartChange(e.target.value)}
        disabled={options.disabled}
        placeholder={options.startPlaceholder || '开始日期'}
        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 
          disabled:bg-slate-100 hover:border-slate-300"
      />
      <span className="text-slate-400 font-medium">至</span>
      <input
        type="date"
        value={currentValue?.[1] || ''}
        onChange={(e) => handleEndChange(e.target.value)}
        disabled={options.disabled}
        placeholder={options.endPlaceholder || '结束日期'}
        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 
          disabled:bg-slate-100 hover:border-slate-300"
      />
    </div>
  );
};

const TimeRangeWidget: React.FC<{
  options: WidgetOptions;
  value: [string, string] | null;
  onChange: (value: [string, string] | null) => void;
}> = ({ options, value, onChange }) => {
  const currentValue = value || options.defaultValue || null;
  
  const handleStartChange = (time: string) => {
    if (currentValue) {
      onChange([time, currentValue[1]]);
    } else {
      onChange([time, '']);
    }
  };
  
  const handleEndChange = (time: string) => {
    if (currentValue) {
      onChange([currentValue[0], time]);
    } else {
      onChange(['', time]);
    }
  };
  
  return (
    <div className="flex items-center gap-3">
      <input
        type="time"
        value={currentValue?.[0] || ''}
        onChange={(e) => handleStartChange(e.target.value)}
        disabled={options.disabled}
        placeholder={options.startPlaceholder || '开始时间'}
        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 
          disabled:bg-slate-100 hover:border-slate-300"
      />
      <span className="text-slate-400 font-medium">至</span>
      <input
        type="time"
        value={currentValue?.[1] || ''}
        onChange={(e) => handleEndChange(e.target.value)}
        disabled={options.disabled}
        placeholder={options.endPlaceholder || '结束时间'}
        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 
          disabled:bg-slate-100 hover:border-slate-300"
      />
    </div>
  );
};

const ColorWidget: React.FC<{
  options: WidgetOptions;
  value: string;
  onChange: (value: string) => void;
}> = ({ options, value, onChange }) => {
  const currentValue = value || options.defaultValue || '#000000';
  
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={currentValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={options.disabled}
        className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
          hover:border-slate-300 transition-colors"
      />
      <input
        type="text"
        value={currentValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={options.disabled}
        placeholder="#000000"
        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-sm
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 
          disabled:bg-slate-100 hover:border-slate-300"
      />
    </div>
  );
};

const SliderWidget: React.FC<{
  options: WidgetOptions;
  value: number;
  onChange: (value: number) => void;
}> = ({ options, value, onChange }) => {
  const currentValue = value ?? options.defaultValue ?? options.min ?? 0;
  const min = options.min ?? 0;
  const max = options.max ?? 100;
  const step = options.step ?? 1;
  const percentage = ((currentValue - min) / (max - min)) * 100;
  
  return (
    <div className="w-full px-1">
      <div className="relative">
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-150"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={options.disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-blue-500 pointer-events-none transition-all duration-150"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-slate-500">{min}</span>
        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold">
          {currentValue}
        </span>
        <span className="text-xs text-slate-500">{max}</span>
      </div>
    </div>
  );
};

const HtmlTextWidget: React.FC<{
  options: WidgetOptions;
}> = ({ options }) => {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: options.htmlContent || '' }}
      className="prose prose-sm max-w-none text-slate-700"
    />
  );
};

const StaticTextWidget: React.FC<{
  options: WidgetOptions;
}> = ({ options }) => {
  const textStyle: React.CSSProperties = {
    textAlign: options.textAlign as any,
    fontSize: options.fontSize,
    fontStyle: options.fontStyle as any,
    fontWeight: options.fontWeight as any,
    whiteSpace: options.preWrap ? 'pre-wrap' : 'normal',
  };
  
  return (
    <div style={textStyle} className="text-slate-700">
      {options.textContent}
    </div>
  );
};

const ButtonWidget: React.FC<{
  options: WidgetOptions;
  onClick?: () => void;
}> = ({ options, onClick }) => {
  const buttonType = options.type || 'button';
  const displayStyle = options.displayStyle || 'block';
  
  const getButtonClasses = () => {
    const base = 'px-5 py-2.5 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    const sizeClass = options.size === 'small' ? 'text-sm px-3 py-1.5' : options.size === 'large' ? 'text-lg px-7 py-3' : '';
    
    if (options.displayStyle === 'inline') {
      return `${base} ${sizeClass} inline-block`;
    }
    
    return `${base} ${sizeClass} ${displayStyle === 'block' ? 'block w-full' : 'inline-block'}`;
  };
  
  const getButtonStyle = () => {
    if (options.circle) return 'rounded-full w-10 h-10 p-0 flex items-center justify-center';
    if (options.round) return 'rounded-full';
    if (options.plain) {
      return 'border-2 border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-blue-500';
    }
    return 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow-md focus:ring-blue-500';
  };
  
  return (
    <button
      type={buttonType as any}
      onClick={onClick}
      disabled={options.disabled}
      className={`${getButtonClasses()} ${getButtonStyle()} ${options.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {options.icon && !options.circle && (
        <span className="mr-2">{options.icon}</span>
      )}
      {options.label}
    </button>
  );
};

const renderWidget = (
  widget: Widget,
  formData: Record<string, any>,
  optionData: Record<string, any>,
  onChange: (name: string, value: any) => void,
  onButtonClick?: (widget: Widget) => void
): React.ReactNode => {
  const { type, options } = widget;
  const value = formData[options.name];
  
  switch (type) {
    case 'input':
      return <InputWidget options={options} value={value} onChange={(v) => onChange(options.name, v)} />;
    case 'date':
      return <DateWidget options={options} value={value} onChange={(v) => onChange(options.name, v)} />;
    case 'select':
      return <SelectWidget options={options} value={value} optionData={optionData} onChange={(v) => onChange(options.name, v)} />;
    case 'radio':
      return <RadioWidget options={options} value={value} optionData={optionData} onChange={(v) => onChange(options.name, v)} />;
    case 'checkbox':
      return <CheckboxWidget options={options} value={value} optionData={optionData} onChange={(v) => onChange(options.name, v)} />;
    case 'switch':
      return <SwitchWidget options={options} value={value} onChange={(v) => onChange(options.name, v)} />;
    case 'rate':
      return <RateWidget options={options} value={value} onChange={(v) => onChange(options.name, v)} />;
    case 'date-range':
      return <DateRangeWidget options={options} value={value} onChange={(v) => onChange(options.name, v)} />;
    case 'time-range':
      return <TimeRangeWidget options={options} value={value} onChange={(v) => onChange(options.name, v)} />;
    case 'color':
      return <ColorWidget options={options} value={value} onChange={(v) => onChange(options.name, v)} />;
    case 'slider':
      return <SliderWidget options={options} value={value} onChange={(v) => onChange(options.name, v)} />;
    case 'html-text':
      return <HtmlTextWidget options={options} />;
    case 'static-text':
      return <StaticTextWidget options={options} />;
    case 'button':
      return <ButtonWidget options={options} onClick={() => onButtonClick?.(widget)} />;
    default:
      return (
        <div className="text-slate-400 italic text-sm">
          暂不支持的控件类型: {type}
        </div>
      );
  }
};

const FormRenderer = forwardRef<FormRendererRef, FormRendererProps>(({
  schema: initialSchema,
  formData: externalFormData,
  optionData: externalOptionData,
  onSubmit,
  onReset,
  onFormDataChange,
  onValidate,
  readOnly = false,
}, ref) => {
  const [schema, setSchema] = useState<FormSchema>(initialSchema);
  const [internalFormData, setInternalFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    initialSchema.widgetList.forEach((widget) => {
      if (widget.formItemFlag && widget.options.name) {
        initial[widget.options.name] = widget.options.defaultValue;
      }
    });
    return initial;
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const formRef = useRef<HTMLFormElement>(null);
  
  const { formConfig, widgetList } = schema;
  const labelWidth = formConfig.labelWidth || 100;
  const labelPosition = formConfig.labelPosition || 'left';
  const optionData = externalOptionData || {};
  
  const formData = externalFormData !== undefined ? externalFormData : internalFormData;
  
  useEffect(() => {
    if (externalFormData !== undefined) {
      setInternalFormData(externalFormData);
    }
  }, [externalFormData]);
  
  useImperativeHandle(ref, () => ({
    getFormData: () => Promise.resolve({ ...formData }),
    setFormData: (newFormData: Record<string, any>) => {
      if (externalFormData === undefined) {
        setInternalFormData(newFormData);
      }
    },
    resetForm: () => {
      const initial: Record<string, any> = {};
      widgetList.forEach((widget) => {
        if (widget.formItemFlag && widget.options.name) {
          initial[widget.options.name] = widget.options.defaultValue;
        }
      });
      setInternalFormData(initial);
      setErrors({});
      setTouched({});
      onReset?.();
    },
    validate: async () => {
      const errorFields: Record<string, string> = {};
      
      for (const widget of widgetList) {
        if (!widget.formItemFlag || !widget.options.name) continue;
        
        const value = formData[widget.options.name];
        const { required, validation, validationHint, label, minLength, maxLength } = widget.options;
        
        if (required) {
          const isEmpty = value === undefined || value === null || value === '' || 
            (Array.isArray(value) && value.length === 0);
          if (isEmpty) {
            errorFields[widget.options.name] = validationHint || `${label}为必填项`;
            continue;
          }
        }
        
        if (minLength && typeof value === 'string' && value.length < minLength) {
          errorFields[widget.options.name] = `最少${minLength}个字符`;
          continue;
        }
        
        if (maxLength && typeof value === 'string' && value.length > maxLength) {
          errorFields[widget.options.name] = `最多${maxLength}个字符`;
          continue;
        }
        
        if (validation) {
          try {
            const regex = new RegExp(validation);
            if (!regex.test(value)) {
              errorFields[widget.options.name] = validationHint || `${label}格式不正确`;
            }
          } catch {
            console.warn('Invalid validation regex:', validation);
          }
        }
      }
      
      setErrors(errorFields);
      onValidate?.(Object.keys(errorFields).length === 0, errorFields);
      return { valid: Object.keys(errorFields).length === 0, errorFields };
    },
    clearValidate: () => {
      setErrors({});
      setTouched({});
    },
    getFieldWidgets: () => widgetList.filter(w => w.formItemFlag),
    setFormJson: (newSchema: FormSchema) => {
      setSchema(newSchema);
      const initial: Record<string, any> = {};
      newSchema.widgetList.forEach((widget) => {
        if (widget.formItemFlag && widget.options.name) {
          initial[widget.options.name] = widget.options.defaultValue;
        }
      });
      setInternalFormData(initial);
      setErrors({});
      setTouched({});
    },
  }), [formData, widgetList, externalFormData, onReset, onValidate]);
  
  const handleChange = useCallback((name: string, value: any) => {
    const newFormData = { ...formData, [name]: value };
    if (externalFormData === undefined) {
      setInternalFormData(newFormData);
    }
    onFormDataChange?.(newFormData);
    
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }, [formData, externalFormData, onFormDataChange, errors]);
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    const allTouched: Record<string, boolean> = {};
    widgetList.forEach((widget) => {
      if (widget.formItemFlag && widget.options.name) {
        allTouched[widget.options.name] = true;
      }
    });
    setTouched(allTouched);
    
    const errorFields: Record<string, string> = {};
    
    widgetList.forEach((widget) => {
      if (!widget.formItemFlag || !widget.options.name) return;
      
      const value = formData[widget.options.name];
      const { required, validation, validationHint, label, minLength, maxLength } = widget.options;
      
      if (required) {
        const isEmpty = value === undefined || value === null || value === '' || 
          (Array.isArray(value) && value.length === 0);
        if (isEmpty) {
          errorFields[widget.options.name] = validationHint || `${label}为必填项`;
          return;
        }
      }
      
      if (minLength && typeof value === 'string' && value.length < minLength) {
        errorFields[widget.options.name] = `最少${minLength}个字符`;
        return;
      }
      
      if (maxLength && typeof value === 'string' && value.length > maxLength) {
        errorFields[widget.options.name] = `最多${maxLength}个字符`;
        return;
      }
      
      if (validation && value) {
        try {
          const regex = new RegExp(validation);
          if (!regex.test(value)) {
            errorFields[widget.options.name] = validationHint || `${label}格式不正确`;
          }
        } catch {
          console.warn('Invalid validation regex:', validation);
        }
      }
    });
    
    setErrors(errorFields);
    onValidate?.(Object.keys(errorFields).length === 0, errorFields);
    
    if (Object.keys(errorFields).length === 0) {
      onSubmit?.(formData);
    }
  }, [widgetList, formData, onSubmit, onValidate]);
  
  const handleReset = useCallback(() => {
    const initial: Record<string, any> = {};
    widgetList.forEach((widget) => {
      if (widget.formItemFlag && widget.options.name) {
        initial[widget.options.name] = widget.options.defaultValue;
      }
    });
    setInternalFormData(initial);
    setErrors({});
    setTouched({});
    onReset?.();
  }, [widgetList, onReset]);
  
  const handleButtonClick = useCallback((widget: Widget) => {
    console.log('Button clicked:', widget.options.name);
    onSubmit?.(formData);
  }, [formData, onSubmit]);
  
  const labelAlignClass = labelPosition === 'left' 
    ? 'items-start' 
    : labelPosition === 'right' 
      ? 'items-end' 
      : 'items-center';
  
  return (
    <form 
      ref={formRef} 
      onSubmit={handleSubmit} 
      className="v-form-renderer w-full"
      style={{ 
        '--label-width': `${labelWidth}px`,
        '--label-position': labelPosition 
      } as React.CSSProperties}
    >
      <div className="space-y-5">
        {widgetList.map((widget) => {
          if (widget.options.hidden) return null;
          
          if (!widget.formItemFlag) {
            return (
              <div key={widget.id} className="py-3">
                {renderWidget(widget, formData, optionData, handleChange, handleButtonClick)}
              </div>
            );
          }
          
          const fieldName = widget.options.name;
          const hasError = touched[fieldName] && !!errors[fieldName];
          const isRequired = widget.options.required;
          
          return (
            <div
              key={widget.id}
              className={`flex ${labelAlignClass} gap-6 transition-all duration-200 ${
                hasError ? 'animate-pulse' : ''
              }`}
            >
              {!widget.options.labelHidden && (
                <label
                  className={`flex-shrink-0 text-sm font-medium transition-colors ${
                    hasError ? 'text-red-500' : 'text-slate-700'
                  } ${labelPosition === 'top' ? 'w-full mb-2' : ''}`}
                  style={{ width: labelPosition === 'top' ? '100%' : labelWidth }}
                >
                  {isRequired && (
                    <span className="text-red-500 mr-1">*</span>
                  )}
                  {widget.options.label}
                  {labelPosition !== 'top' && (
                    <span className="float-right ml-1">:</span>
                  )}
                </label>
              )}
              <div className={`flex-1 transition-all duration-200 ${hasError ? '' : ''}`}>
                {renderWidget(widget, formData, optionData, handleChange, handleButtonClick)}
                {hasError && (
                  <div className="mt-1.5 flex items-center gap-1 animate-fade-in">
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-500">
                      {errors[fieldName]}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {!readOnly && (
        <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-200 bg-slate-50 -mx-4 px-4 pb-4 rounded-b-xl">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-500 text-white font-medium rounded-lg 
              hover:bg-blue-600 active:bg-blue-700 transition-all duration-200 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
              shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              提交
            </span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2.5 bg-white text-slate-700 font-medium rounded-lg 
              border border-slate-300 hover:bg-slate-50 active:bg-slate-100 transition-all duration-200 
              focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              重置
            </span>
          </button>
        </div>
      )}
    </form>
  );
});

FormRenderer.displayName = 'FormRenderer';

export default FormRenderer;
