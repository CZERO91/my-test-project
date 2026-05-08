import React, { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
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
}> = ({ options, value, onChange }) => {
  const inputType = options.type === 'number' ? 'number' : options.type === 'password' ? 'password' : 'text';
  
  return (
    <div className="relative group">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/8 to-indigo-500/8 opacity-0 group-focus-within:opacity-100 transition-all duration-300 blur-sm" />
      <input
        type={inputType}
        name={options.name}
        value={value ?? options.defaultValue ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={options.placeholder || '请输入'}
        disabled={options.disabled}
        readOnly={options.readonly}
        maxLength={options.maxLength ?? undefined}
        minLength={options.minLength ?? undefined}
        className="relative w-full px-4 py-3 bg-white/95 border border-slate-150 rounded-2xl text-slate-700 placeholder-slate-400 text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 
          disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-100
          hover:border-slate-200 hover:bg-white transition-all duration-200"
      />
      {options.suffixIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          {options.suffixIcon}
        </div>
      )}
      {options.prefixIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {options.prefixIcon}
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
  const inputType = options.type === 'week' ? 'week' : options.type === 'month' ? 'month' : options.type === 'year' ? 'number' : 'date';
  
  return (
    <div className="relative group">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/8 to-indigo-500/8 opacity-0 group-focus-within:opacity-100 transition-all duration-300 blur-sm" />
      <input
        type={inputType}
        name={options.name}
        value={value ?? options.defaultValue ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={options.disabled}
        readOnly={options.readonly}
        className="relative w-full px-4 py-3 pr-10 bg-white/95 border border-slate-150 rounded-2xl text-slate-700 text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 
          disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-100
          hover:border-slate-200 hover:bg-white transition-all duration-200
          [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
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
    <div className="relative group">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/8 to-indigo-500/8 opacity-0 group-focus-within:opacity-100 transition-all duration-300 blur-sm" />
      <select
        name={options.name}
        value={currentValue}
        onChange={handleChange}
        disabled={options.disabled}
        multiple={options.multiple}
        className={`relative w-full px-4 py-3 bg-white/95 border border-slate-150 rounded-2xl text-slate-700 appearance-none text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 
          disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-100
          hover:border-slate-200 hover:bg-white transition-all duration-200 ${options.multiple ? 'min-h-[80px]' : ''}`}
      >
        {!options.multiple && <option value="">请选择</option>}
        {optionItems.map((item: any, index: number) => (
          <option key={index} value={item[options.valueKey || 'value']}>
            {item[options.labelKey || 'label']}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-slate-400 transition-transform duration-200 group-focus-within:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
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
    <div className={`flex ${displayStyle === 'inline' ? 'flex-row flex-wrap gap-6' : 'flex-col gap-3'}`}>
      {optionItems.map((item: any, index: number) => {
        const itemValue = item[options.valueKey || 'value'];
        const isChecked = currentValue === itemValue;
        
        return (
          <label 
            key={index} 
            className={`flex items-center gap-3 cursor-pointer group ${
              options.disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className={`relative w-5 h-5 transition-all duration-200 ${
              options.disabled ? '' : 'group-hover:scale-105'
            }`}>
              <div className={`absolute inset-0 rounded-full border-2 transition-all duration-200 ${
                isChecked 
                  ? 'border-blue-500 bg-blue-500' 
                  : 'border-slate-300 group-hover:border-blue-400 bg-white'
              }`} />
              {isChecked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            <input
              type="radio"
              name={options.name}
              value={itemValue}
              checked={isChecked}
              onChange={() => !options.disabled && onChange(itemValue)}
              disabled={options.disabled}
              className="sr-only"
            />
            <span className="text-slate-700 group-hover:text-blue-600 transition-colors text-sm font-medium">
              {item[options.labelKey || 'label']}
            </span>
          </label>
        );
      })}
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
    <div className={`flex ${displayStyle === 'inline' ? 'flex-row flex-wrap gap-6' : 'flex-col gap-3'}`}>
      {optionItems.map((item: any, index: number) => {
        const itemValue = item[options.valueKey || 'value'];
        const isChecked = currentValue.includes(itemValue);
        
        return (
          <label 
            key={index} 
            className={`flex items-center gap-3 cursor-pointer group ${
              options.disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className={`relative w-5 h-5 transition-all duration-200 ${
              options.disabled ? '' : 'group-hover:scale-105'
            }`}>
              <div className={`absolute inset-0 rounded border-2 transition-all duration-200 ${
                isChecked 
                  ? 'border-blue-500 bg-blue-500' 
                  : 'border-slate-300 group-hover:border-blue-400 bg-white'
              }`} />
              {isChecked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            <input
              type="checkbox"
              value={itemValue}
              checked={isChecked}
              onChange={(e) => handleChange(itemValue, e.target.checked)}
              disabled={options.disabled}
              className="sr-only"
            />
            <span className="text-slate-700 group-hover:text-blue-600 transition-colors text-sm font-medium">
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
  const switchWidth = options.switchWidth || 40;
  
  return (
    <button
      type="button"
      role="switch"
      aria-checked={currentValue}
      onClick={() => !options.disabled && onChange(!currentValue)}
      disabled={options.disabled}
      className={`relative inline-flex h-8 items-center rounded-full transition-all duration-350 ease-out 
        focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2
        ${currentValue 
          ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-500 shadow-lg shadow-blue-500/30' 
          : 'bg-slate-200 hover:bg-slate-250'
        }
        ${options.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      style={{ width: switchWidth + 24 }}
    >
      <span
        className={`absolute w-6 h-6 transform rounded-full transition-all duration-350 ease-out ${
          currentValue 
            ? `left-[${switchWidth - 2}px] bg-white shadow-lg shadow-slate-300/50` 
            : 'left-1 bg-white shadow-md'
        }`}
      >
        <div className={`absolute inset-0 rounded-full transition-opacity duration-200 ${
          currentValue ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="absolute inset-1.5 bg-gradient-to-br from-blue-400/30 to-transparent rounded-full" />
        </div>
      </span>
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
    <div className="flex gap-2 items-center">
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
            className={`focus:outline-none transition-all duration-250 ${
              options.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-115'
            }`}
          >
            <svg
              className={`w-8 h-8 transition-all duration-200 ${
                filled 
                  ? 'text-gradient-to-br from-yellow-400 to-yellow-500 drop-shadow-md' 
                  : 'text-slate-150 hover:text-slate-250'
              }`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M11.05 2.02c.31-.92 1.6-.92 1.91 0l1.58 4.86a1 1 0 00.95.69h4.63c.98 0 1.37 1.24.58 1.81l-3.88 2.86a1 1 0 00-.36 1.12l1.1 4.24c.2.74-.64 1.39-1.27.92l-3.24-1.65a1 1 0 00-1.06 0l-3.24 1.65c-.63.47-1.47-.18-1.27-.92l1.1-4.24a1 1 0 00-.36-1.12l-3.88-2.86c-.79-.57-.4-1.81.58-1.81h4.62a1 1 0 00.95-.69l1.58-4.86z" />
            </svg>
          </button>
        );
      })}
      {(options.showScore || options.showText) && (
        <span className="ml-4 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-full text-sm font-semibold">
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
    <div className="flex items-center gap-2">
      <div className="relative flex-1 group">
        <input
          type="date"
          value={currentValue?.[0] || ''}
          onChange={(e) => handleStartChange(e.target.value)}
          disabled={options.disabled}
          placeholder={options.startPlaceholder || '开始日期'}
          className="w-full px-4 py-3 pr-10 bg-white/95 border border-slate-150 rounded-xl text-slate-700 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-100
            hover:border-slate-200 hover:bg-white transition-all duration-200
            [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      <div className="flex items-center justify-center w-10">
        <div className="w-6 h-px bg-slate-200 relative">
          <svg className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <div className="relative flex-1 group">
        <input
          type="date"
          value={currentValue?.[1] || ''}
          onChange={(e) => handleEndChange(e.target.value)}
          disabled={options.disabled}
          placeholder={options.endPlaceholder || '结束日期'}
          className="w-full px-4 py-3 pr-10 bg-white/95 border border-slate-150 rounded-xl text-slate-700 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-100
            hover:border-slate-200 hover:bg-white transition-all duration-200
            [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
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
      <div className="relative flex-1 group">
        <input
          type="time"
          value={currentValue?.[0] || ''}
          onChange={(e) => handleStartChange(e.target.value)}
          disabled={options.disabled}
          placeholder={options.startPlaceholder || '开始时间'}
          className="w-full px-4 py-3 pr-10 bg-white/95 border border-slate-150 rounded-xl text-slate-700 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-100
            hover:border-slate-200 hover:bg-white transition-all duration-200"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <div className="flex items-center justify-center w-10">
        <div className="w-6 h-px bg-slate-200 relative">
          <svg className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <div className="relative flex-1 group">
        <input
          type="time"
          value={currentValue?.[1] || ''}
          onChange={(e) => handleEndChange(e.target.value)}
          disabled={options.disabled}
          placeholder={options.endPlaceholder || '结束时间'}
          className="w-full px-4 py-3 pr-10 bg-white/95 border border-slate-150 rounded-xl text-slate-700 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-100
            hover:border-slate-200 hover:bg-white transition-all duration-200"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
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
      <div className="relative group">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-sm" />
        <input
          type="color"
          value={currentValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={options.disabled}
          className="relative w-12 h-12 rounded-xl border-2 border-slate-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
            hover:border-slate-250 hover:scale-105 transition-all duration-200"
        />
      </div>
      <input
        type="text"
        value={currentValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={options.disabled}
        placeholder="#000000"
        className="flex-1 px-4 py-3 bg-white/95 border border-slate-150 rounded-xl text-slate-700 font-mono text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 
          disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-100
          hover:border-slate-200 hover:bg-white transition-all duration-200"
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
    <div className="w-full px-2">
      <div className="relative h-3">
        <div className="absolute inset-y-0 left-0 right-0 flex items-center">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 rounded-full transition-all duration-200"
              style={{ width: `${percentage}%` }}
            />
          </div>
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
          className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg shadow-slate-300/50 border-2 border-blue-500 
            pointer-events-none transition-all duration-200 ${options.disabled ? 'opacity-50' : ''}`}
          style={{ left: `calc(${percentage}% - 12px)` }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-blue-50/50" />
          <div className="absolute inset-1 rounded-full bg-blue-500/10" />
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-slate-500 font-medium">{min}</span>
        <div className="px-4 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-full text-sm font-semibold">
          {currentValue}
        </div>
        <span className="text-sm text-slate-500 font-medium">{max}</span>
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
    <div style={textStyle} className="text-slate-700 font-medium">
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
    const base = 'px-5 py-3 font-semibold rounded-xl transition-all duration-250 focus:outline-none focus:ring-2 focus:ring-offset-2';
    const sizeClass = options.size === 'small' ? 'text-sm px-3 py-2' : options.size === 'large' ? 'text-lg px-8 py-3.5' : '';
    
    if (options.displayStyle === 'inline') {
      return `${base} ${sizeClass} inline-flex items-center justify-center`;
    }
    
    return `${base} ${sizeClass} ${displayStyle === 'block' ? 'w-full' : 'inline-flex items-center justify-center'}`;
  };
  
  const getButtonStyle = () => {
    if (options.circle) return 'rounded-full w-11 h-11 p-0 flex items-center justify-center';
    if (options.round) return 'rounded-full';
    if (options.plain) {
      return 'bg-white/80 border border-slate-150 text-slate-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 focus:ring-blue-500/30';
    }
    return 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-500 text-white hover:from-blue-600 hover:via-blue-700 hover:to-indigo-600 shadow-md hover:shadow-lg focus:ring-blue-500/30 hover:-translate-y-0.5';
  };
  
  return (
    <button
      type={buttonType as any}
      onClick={onClick}
      disabled={options.disabled}
      className={`${getButtonClasses()} ${getButtonStyle()} ${options.disabled ? 'opacity-50 cursor-not-allowed transform-none shadow-none' : ''}`}
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
    <form className="v-form-renderer w-full space-y-7" onSubmit={handleSubmit}>
      {widgetList.map((widget) => {
        if (widget.options.hidden) return null;
        
        if (!widget.formItemFlag) {
          return (
            <div key={widget.id} className="py-4">
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
            className={`flex ${labelAlignClass} gap-5 transition-all duration-300`}
          >
            {!widget.options.labelHidden && (
              <label
                className={`flex-shrink-0 text-sm font-semibold transition-colors ${
                  hasError ? 'text-red-500' : 'text-slate-700'
                } ${labelPosition === 'top' ? 'w-full mb-2.5' : ''}`}
                style={{ width: labelPosition === 'top' ? '100%' : labelWidth }}
              >
                <div className="flex items-center justify-between">
                  <span>
                    {isRequired && (
                      <span className="text-red-500 mr-1.5">*</span>
                    )}
                    {widget.options.label}
                  </span>
                  {labelPosition !== 'top' && (
                    <span className="text-slate-400 ml-1">:</span>
                  )}
                </div>
              </label>
            )}
            <div className={`flex-1 transition-all duration-200 ${hasError ? '' : ''}`}>
              <div className={`transition-all duration-200 ${hasError ? 'ring-2 ring-red-500/25 rounded-2xl' : ''}`}>
                {renderWidget(widget, formData, optionData, handleChange, handleButtonClick)}
              </div>
              {hasError && (
                <div className="mt-2.5 flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-500 font-medium">
                    {errors[fieldName]}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      {!readOnly && (
        <div className="flex items-center gap-4 pt-6 mt-6 border-t border-slate-100">
          <button
            type="submit"
            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-500 text-white font-semibold rounded-xl 
              hover:from-blue-600 hover:via-blue-700 hover:to-indigo-600 active:from-blue-700 active:via-blue-800 active:to-indigo-700 transition-all duration-250 
              focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 
              shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              提交表单
            </span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3.5 bg-white/95 text-slate-700 font-semibold rounded-xl 
              border border-slate-150 hover:border-slate-250 hover:bg-slate-50 active:bg-slate-100 transition-all duration-250 
              focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:ring-offset-2
              shadow-sm hover:shadow-md"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
