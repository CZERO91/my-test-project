import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { FormSchema, Widget, WidgetOptions } from '../types/schema';

interface FormRendererProps {
  schema: FormSchema;
  formData?: Record<string, any>;
  onSubmit?: (data: Record<string, any>) => void;
  onReset?: () => void;
  onFormDataChange?: (data: Record<string, any>) => void;
  readOnly?: boolean;
}

const InputWidget: React.FC<{
  options: WidgetOptions;
  value: any;
  onChange: (value: any) => void;
}> = ({ options, value, onChange }) => {
  const inputType = options.type === 'number' ? 'number' : options.type === 'password' ? 'password' : 'text';
  
  return (
    <input
      type={inputType}
      name={options.name}
      value={value ?? options.defaultValue ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={options.placeholder}
      disabled={options.disabled}
      readOnly={options.readonly}
      maxLength={options.maxLength ?? undefined}
      minLength={options.minLength ?? undefined}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 disabled:bg-slate-100 disabled:cursor-not-allowed"
    />
  );
};

const DateWidget: React.FC<{
  options: WidgetOptions;
  value: any;
  onChange: (value: any) => void;
}> = ({ options, value, onChange }) => {
  return (
    <input
      type="date"
      name={options.name}
      value={value ?? options.defaultValue ?? ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={options.disabled}
      readOnly={options.readonly}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 disabled:bg-slate-100 disabled:cursor-not-allowed"
    />
  );
};

const SelectWidget: React.FC<{
  options: WidgetOptions;
  value: any;
  onChange: (value: any) => void;
}> = ({ options, value, onChange }) => {
  const optionItems = options.optionItems || [];
  
  return (
    <select
      name={options.name}
      value={value ?? options.defaultValue ?? ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={options.disabled}
      multiple={options.multiple}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 disabled:bg-slate-100 disabled:cursor-not-allowed bg-white"
    >
      {options.placeholder && <option value="">{options.placeholder}</option>}
      {optionItems.map((item, index) => (
        <option key={index} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
};

const RadioWidget: React.FC<{
  options: WidgetOptions;
  value: any;
  onChange: (value: any) => void;
}> = ({ options, value, onChange }) => {
  const optionItems = options.optionItems || [];
  const displayStyle = options.displayStyle || 'inline';
  
  return (
    <div className={`flex ${displayStyle === 'inline' ? 'flex-row flex-wrap gap-4' : 'flex-col gap-2'}`}>
      {optionItems.map((item, index) => (
        <label key={index} className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name={options.name}
            value={item.value}
            checked={value === item.value || (!value && options.defaultValue === item.value)}
            onChange={() => onChange(item.value)}
            disabled={options.disabled}
            className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500"
          />
          <span className="text-slate-700 group-hover:text-slate-900 transition-colors">{item.label}</span>
        </label>
      ))}
    </div>
  );
};

const CheckboxWidget: React.FC<{
  options: WidgetOptions;
  value: any[];
  onChange: (value: any[]) => void;
}> = ({ options, value, onChange }) => {
  const optionItems = options.optionItems || [];
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
      {optionItems.map((item, index) => (
        <label key={index} className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            value={item.value}
            checked={currentValue.includes(item.value)}
            onChange={(e) => handleChange(item.value, e.target.checked)}
            disabled={options.disabled}
            className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
          />
          <span className="text-slate-700 group-hover:text-slate-900 transition-colors">{item.label}</span>
        </label>
      ))}
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
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
        currentValue ? 'bg-primary-600' : 'bg-slate-300'
      } ${options.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
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
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !options.disabled && onChange(star)}
          onMouseEnter={() => !options.disabled && setHoverValue(star)}
          onMouseLeave={() => setHoverValue(null)}
          disabled={options.disabled}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <svg
            className={`w-6 h-6 ${
              (hoverValue ?? currentValue) >= star
                ? 'text-yellow-400 fill-current'
                : 'text-slate-300'
            } ${options.disabled ? 'opacity-50' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
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
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={currentValue?.[0] || ''}
        onChange={(e) => handleStartChange(e.target.value)}
        disabled={options.disabled}
        placeholder={options.startPlaceholder}
        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 disabled:bg-slate-100"
      />
      <span className="text-slate-400">至</span>
      <input
        type="date"
        value={currentValue?.[1] || ''}
        onChange={(e) => handleEndChange(e.target.value)}
        disabled={options.disabled}
        placeholder={options.endPlaceholder}
        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 disabled:bg-slate-100"
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
    <div className="flex items-center gap-2">
      <input
        type="time"
        value={currentValue?.[0] || ''}
        onChange={(e) => handleStartChange(e.target.value)}
        disabled={options.disabled}
        placeholder={options.startPlaceholder}
        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 disabled:bg-slate-100"
      />
      <span className="text-slate-400">至</span>
      <input
        type="time"
        value={currentValue?.[1] || ''}
        onChange={(e) => handleEndChange(e.target.value)}
        disabled={options.disabled}
        placeholder={options.endPlaceholder}
        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 disabled:bg-slate-100"
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
        className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <input
        type="text"
        value={currentValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={options.disabled}
        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 font-mono text-sm disabled:bg-slate-100"
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
  
  return (
    <div className="w-full">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={options.disabled}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>{min}</span>
        <span className="font-medium text-slate-700">{currentValue}</span>
        <span>{max}</span>
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
      className="prose prose-sm max-w-none"
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
  
  return (
    <div className={displayStyle === 'block' ? 'block' : 'inline-block'}>
      <button
        type={buttonType as any}
        onClick={onClick}
        disabled={options.disabled}
        className={`px-4 py-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
          options.plain
            ? 'border border-primary-600 text-primary-600 hover:bg-primary-50'
            : 'bg-primary-600 text-white hover:bg-primary-700'
        } ${options.round ? 'rounded-full' : ''} ${options.circle ? 'rounded-full w-10 h-10 p-0' : ''} ${
          options.disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {options.label}
      </button>
    </div>
  );
};

const renderWidget = (
  widget: Widget,
  formData: Record<string, any>,
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
      return <SelectWidget options={options} value={value} onChange={(v) => onChange(options.name, v)} />;
    case 'radio':
      return <RadioWidget options={options} value={value} onChange={(v) => onChange(options.name, v)} />;
    case 'checkbox':
      return <CheckboxWidget options={options} value={value} onChange={(v) => onChange(options.name, v)} />;
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
        <div className="text-slate-400 italic">
          未知控件类型: {type}
        </div>
      );
  }
};

const FormRenderer: React.FC<FormRendererProps> = ({
  schema,
  formData: externalFormData,
  onSubmit,
  onReset,
  onFormDataChange,
  readOnly = false,
}) => {
  const { formConfig, widgetList } = schema;
  const labelWidth = formConfig.labelWidth || 80;
  const labelPosition = formConfig.labelPosition || 'left';
  
  const [internalFormData, setInternalFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    widgetList.forEach((widget) => {
      if (widget.formItemFlag && widget.options.name) {
        initial[widget.options.name] = widget.options.defaultValue;
      }
    });
    return initial;
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  
  const formData = externalFormData !== undefined ? externalFormData : internalFormData;
  
  useEffect(() => {
    if (externalFormData !== undefined) {
      setInternalFormData(externalFormData);
    }
  }, [externalFormData]);
  
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
  
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    
    widgetList.forEach((widget) => {
      if (widget.formItemFlag && widget.options.required) {
        const value = formData[widget.options.name];
        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
          newErrors[widget.options.name] = widget.options.requiredHint || `${widget.options.label}为必填项`;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [widgetList, formData]);
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit?.(formData);
    }
  }, [formData, validateForm, onSubmit]);
  
  const handleReset = useCallback(() => {
    const initial: Record<string, any> = {};
    widgetList.forEach((widget) => {
      if (widget.formItemFlag && widget.options.name) {
        initial[widget.options.name] = widget.options.defaultValue;
      }
    });
    setInternalFormData(initial);
    setErrors({});
    onReset?.();
  }, [widgetList, onReset]);
  
  const getFormData = useCallback(() => {
    return formData;
  }, [formData]);
  
  const labelAlignClass = labelPosition === 'left' ? 'items-start' : labelPosition === 'right' ? 'items-end' : 'items-center';
  
  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {widgetList.map((widget) => {
        if (widget.options.hidden) return null;
        
        if (!widget.formItemFlag) {
          return (
            <div key={widget.id} className="py-2">
              {renderWidget(widget, formData, handleChange)}
            </div>
          );
        }
        
        const hasError = !!errors[widget.options.name];
        
        return (
          <div
            key={widget.id}
            className={`flex ${labelAlignClass} gap-4 ${hasError ? 'animate-shake' : ''}`}
          >
            {!widget.options.labelHidden && (
              <label
                className="flex-shrink-0 text-sm font-medium text-slate-700"
                style={{ width: labelWidth }}
              >
                {widget.options.required && (
                  <span className="text-red-500 mr-1">*</span>
                )}
                {widget.options.label}
              </label>
            )}
            <div className="flex-1">
              {renderWidget(widget, formData, handleChange)}
              {hasError && (
                <p className="mt-1 text-sm text-red-500 animate-fade-in">
                  {errors[widget.options.name]}
                </p>
              )}
            </div>
          </div>
        );
      })}
      
      {!readOnly && (
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
          >
            提交
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2 bg-white text-slate-700 font-medium rounded-lg border border-slate-300 hover:bg-slate-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            重置
          </button>
          <button
            type="button"
            onClick={() => console.log('Form Data:', getFormData())}
            className="px-6 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            获取数据
          </button>
        </div>
      )}
    </form>
  );
};

export default FormRenderer;
