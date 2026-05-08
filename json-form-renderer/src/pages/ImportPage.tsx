import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import FormRenderer from '../components/FormRenderer';
import type { FormSchema, FormConfigRecord } from '../types/schema';
import {
  saveFormConfig,
  loadFormConfigs,
  loadFormConfig,
  deleteFormConfig,
  saveFormSubmission,
} from '../lib/supabase';

const sampleJson: FormSchema = {
  formConfig: {
    onFormCreated: '',
    functions: '',
    gridResponsive: true,
    labelWidth: 100,
    onFormUnmounted: '',
    actionRules: [],
    labelPosition: 'left',
    mobileLabelAlign: 'label-left-align',
    onFormValidate: '',
    onFormMounted: '',
    layoutType: 'PC',
    jsonVersion: 3,
    refName: 'vForm',
    dashboardGridRowHeight: 48,
    dataSources: [],
    onAfterSetFormData: '',
    cssCode: '',
    calculateFormulaAfterSetFormData: true,
    modelName: 'formData',
    rulesName: 'rules',
    size: '',
    labelAlign: 'label-left-align',
    onFormDataChange: '',
    customClass: [],
    mobileLabelPosition: 'top',
    h5LabelTop: true,
  },
  widgetList: [
    {
      icon: 'date-field',
      options: {
        name: 'gwDate',
        label: '文件日期',
        required: true,
        type: 'date',
        placeholder: '',
        disabled: false,
        hidden: false,
        clearable: true,
        columnWidth: '200px',
      },
      id: 'date74738',
      type: 'date',
      key: 95549,
      formItemFlag: true,
    },
    {
      icon: 'text-field',
      options: {
        name: 'gwHandleKind',
        label: '办件类型',
        required: false,
        type: 'text',
        placeholder: '请输入办件类型',
        disabled: false,
        hidden: false,
        clearable: true,
        columnWidth: '200px',
      },
      id: 'input70281',
      type: 'input',
      key: 16040,
      formItemFlag: true,
    },
    {
      icon: 'text-field',
      options: {
        name: 'gwCode',
        label: '办文编号',
        required: false,
        type: 'text',
        placeholder: '请输入办文编号',
        disabled: false,
        hidden: false,
        clearable: true,
        columnWidth: '200px',
      },
      id: 'input43607',
      type: 'input',
      key: 21061,
      formItemFlag: true,
    },
    {
      icon: 'switch-field',
      options: {
        name: 'isTransfer',
        label: '转办理',
        defaultValue: false,
        switchWidth: 40,
        hidden: false,
        disabled: false,
        columnWidth: '200px',
      },
      id: 'switch39836',
      type: 'switch',
      key: 66094,
      formItemFlag: true,
    },
    {
      icon: 'select-field',
      options: {
        name: 'gwKind',
        label: '办文类别',
        required: false,
        placeholder: '请选择',
        disabled: false,
        hidden: false,
        clearable: true,
        columnWidth: '200px',
        optionItems: [
          { label: '类别一', value: '1' },
          { label: '类别二', value: '2' },
          { label: '类别三', value: '3' },
        ],
      },
      id: 'select84931',
      type: 'select',
      key: 2788,
      formItemFlag: true,
    },
    {
      icon: 'radio-field',
      options: {
        name: 'remindFlag',
        label: '超时提醒',
        required: false,
        defaultValue: 1,
        hidden: false,
        disabled: false,
        displayStyle: 'inline',
        columnWidth: '200px',
        optionItems: [
          { label: '提醒', value: 1 },
          { label: '不提醒', value: 0 },
        ],
      },
      id: 'radio104652',
      type: 'radio',
      key: 92993,
      formItemFlag: true,
    },
    {
      icon: 'checkbox-field',
      options: {
        name: 'checkbox108333',
        label: 'checkbox',
        required: false,
        defaultValue: [],
        hidden: false,
        disabled: false,
        displayStyle: 'inline',
        columnWidth: '200px',
        optionItems: [
          { label: 'check 1', value: 1 },
          { label: 'check 2', value: 2 },
          { label: 'check 3', value: 3 },
        ],
      },
      id: 'checkbox108333',
      type: 'checkbox',
      key: 104543,
      formItemFlag: true,
    },
    {
      icon: 'rate-field',
      options: {
        name: 'rate74053',
        label: 'rate',
        required: false,
        max: 5,
        showText: false,
        showScore: false,
        hidden: false,
        disabled: false,
        columnWidth: '200px',
      },
      id: 'rate74053',
      type: 'rate',
      key: 34959,
      formItemFlag: true,
    },
    {
      icon: 'date-range-field',
      options: {
        name: 'daterange97085',
        label: 'date-range',
        required: false,
        type: 'daterange',
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
        hidden: false,
        disabled: false,
        clearable: true,
        columnWidth: '200px',
      },
      id: 'daterange97085',
      type: 'date-range',
      key: 107192,
      formItemFlag: true,
    },
    {
      icon: 'time-range-field',
      options: {
        name: 'timerange95231',
        label: 'time-range',
        required: false,
        format: 'HH:mm:ss',
        hidden: false,
        disabled: false,
        clearable: true,
        columnWidth: '200px',
      },
      id: 'timerange95231',
      type: 'time-range',
      key: 57249,
      formItemFlag: true,
    },
    {
      icon: 'color-field',
      options: {
        name: 'color70292',
        label: 'color',
        required: false,
        hidden: false,
        disabled: false,
        columnWidth: '200px',
      },
      id: 'color70292',
      type: 'color',
      key: 32907,
      formItemFlag: true,
    },
    {
      icon: 'slider-field',
      options: {
        name: 'slider98494',
        label: 'slider',
        required: false,
        min: 0,
        max: 100,
        step: 10,
        showStops: true,
        hidden: false,
        disabled: false,
        columnWidth: '200px',
      },
      id: 'slider98494',
      type: 'slider',
      key: 89653,
      formItemFlag: true,
    },
    {
      icon: 'html-text',
      options: {
        name: 'htmltext52041',
        label: 'html-text',
        htmlContent: '<div class="p-4 bg-blue-50 rounded-lg border border-blue-200"><b class="text-blue-600">提示信息：</b> 请填写下方表单内容</div>',
        hidden: false,
        columnWidth: '200px',
      },
      id: 'htmltext52041',
      type: 'html-text',
      key: 93864,
      formItemFlag: false,
    },
    {
      icon: 'button',
      options: {
        name: 'button41050',
        label: '自定义按钮',
        type: 'button',
        displayStyle: 'block',
        hidden: false,
        disabled: false,
        columnWidth: '200px',
      },
      id: 'button41050',
      type: 'button',
      key: 50158,
      formItemFlag: false,
    },
    {
      icon: 'static-text',
      options: {
        name: 'statictext57564',
        label: 'static-text',
        textContent: '静态文本内容展示区域',
        textAlign: 'left',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: 'normal',
        preWrap: false,
        hidden: false,
        columnWidth: '200px',
      },
      id: 'statictext57564',
      type: 'static-text',
      key: 113068,
      formItemFlag: false,
    },
  ],
};

const ImportPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const configId = searchParams.get('config');
  
  const [jsonInput, setJsonInput] = useState<string>(JSON.stringify(sampleJson, null, 2));
  const [parsedSchema, setParsedSchema] = useState<FormSchema | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState<FormConfigRecord[]>([]);
  const [showSavedConfigs, setShowSavedConfigs] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [isFormatValid, setIsFormatValid] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    loadSavedConfigs();
    if (configId) {
      loadConfig(configId);
    }
  }, [configId]);
  
  const loadSavedConfigs = async () => {
    try {
      const configs = await loadFormConfigs();
      setSavedConfigs(configs || []);
    } catch (error) {
      console.error('Failed to load saved configs:', error);
    }
  };
  
  const loadConfig = async (id: string) => {
    setIsLoading(true);
    try {
      const config = await loadFormConfig(id);
      if (config) {
        setJsonInput(JSON.stringify(config.config, null, 2));
        setParsedSchema(config.config);
        setParseError(null);
        setIsFormatValid(true);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const parseJson = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.formConfig || !parsed.widgetList) {
        throw new Error('JSON 格式不正确：缺少 formConfig 或 widgetList');
      }
      setParsedSchema(parsed);
      setParseError(null);
      setIsFormatValid(true);
      return true;
    } catch (error) {
      setParsedSchema(null);
      setIsFormatValid(false);
      if (error instanceof Error) {
        setParseError(error.message);
      } else {
        setParseError('JSON 解析失败');
      }
      return false;
    }
  }, []);
  
  const handleJsonChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonInput(value);
    parseJson(value);
  }, [parseJson]);
  
  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonInput(content);
      parseJson(content);
    };
    reader.onerror = () => {
      setParseError('文件读取失败');
    };
    reader.readAsText(file);
  }, [parseJson]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/json' || file.name.endsWith('.json'))) {
      handleFileUpload(file);
    } else {
      setParseError('请上传 JSON 文件');
    }
  }, [handleFileUpload]);
  
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);
  
  const handleFormatJson = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      parseJson(jsonInput);
    } catch {
      // Already handled by parseJson
    }
  }, [jsonInput, parseJson]);
  
  const handleRender = useCallback(() => {
    parseJson(jsonInput);
  }, [jsonInput, parseJson]);
  
  const handleSaveConfig = async () => {
    if (!parsedSchema) return;
    if (!saveName.trim()) {
      alert('请输入配置名称');
      return;
    }
    
    setIsSaving(true);
    try {
      await saveFormConfig(saveName.trim(), parsedSchema);
      setSaveName('');
      await loadSavedConfigs();
      alert('保存成功！');
    } catch (error) {
      console.error('Failed to save config:', error);
      alert('保存失败，请检查 Supabase 配置');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteConfig = async (id: string) => {
    if (!confirm('确定要删除此配置吗？')) return;
    
    try {
      await deleteFormConfig(id);
      await loadSavedConfigs();
    } catch (error) {
      console.error('Failed to delete config:', error);
      alert('删除失败');
    }
  };
  
  const handleFormSubmit = async (data: Record<string, any>) => {
    console.log('Form submitted:', data);
    setSubmitResult(data);
    
    if (parsedSchema && configId) {
      try {
        await saveFormSubmission(configId, data);
        alert('表单数据已保存！');
      } catch (error) {
        console.error('Failed to save submission:', error);
      }
    }
  };
  
  const handleLoadSample = useCallback(() => {
    setJsonInput(JSON.stringify(sampleJson, null, 2));
    setParsedSchema(sampleJson);
    setParseError(null);
    setIsFormatValid(true);
  }, []);
  
  const handleClear = useCallback(() => {
    setJsonInput('');
    setParsedSchema(null);
    setParseError(null);
    setIsFormatValid(false);
    setSubmitResult(null);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">JSON 表单渲染器</h1>
                <p className="text-sm text-slate-500">动态表单配置与预览</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSavedConfigs(!showSavedConfigs)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100/80 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                已保存配置 ({savedConfigs.length})
              </button>
              <Link
                to="/renderer"
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50/80 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                独立渲染器
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {showSavedConfigs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowSavedConfigs(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                已保存的配置
              </h3>
              <button onClick={() => setShowSavedConfigs(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {savedConfigs.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-slate-500">暂无保存的配置</p>
                  <p className="text-sm text-slate-400 mt-1">在右侧编辑并保存表单配置</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedConfigs.map((config) => (
                    <div
                      key={config.id}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl hover:from-blue-50 hover:to-white hover:border-blue-200 transition-all duration-200 group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate group-hover:text-blue-600 transition-colors">{config.name}</p>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(config.created_at).toLocaleString('zh-CN')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            loadConfig(config.id);
                            setShowSavedConfigs(false);
                          }}
                          className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                        >
                          加载
                        </button>
                        <button
                          onClick={() => handleDeleteConfig(config.id)}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
              <div className="p-4 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800">JSON 配置</h2>
                    {isFormatValid && (
                      <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                        格式正确
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleFormatJson}
                      className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                      </svg>
                      格式化
                    </button>
                    <button
                      onClick={handleLoadSample}
                      className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      加载示例
                    </button>
                    <button
                      onClick={handleClear}
                      className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      清空
                    </button>
                  </div>
                </div>
              </div>
              
              <div
                className={`relative transition-colors duration-200 ${isDragging ? 'bg-blue-50' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isDragging && (
                  <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center z-10 backdrop-blur-sm">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-blue-500 mx-auto mb-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-blue-600 font-medium">释放文件以上传</p>
                    </div>
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      上传 JSON 文件
                    </button>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      或拖拽文件到此区域
                    </span>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute top-2 right-2 z-10 flex gap-1">
                      <span className="px-2 py-0.5 text-xs bg-slate-700 text-slate-300 rounded font-mono">
                        {jsonInput.split('\n').length} 行
                      </span>
                    </div>
                    <textarea
                      ref={textareaRef}
                      value={jsonInput}
                      onChange={handleJsonChange}
                      placeholder="在此输入 JSON 配置..."
                      className="w-full h-80 px-4 py-3 font-mono text-sm bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 rounded-xl border-2 border-transparent focus:border-blue-500 focus:ring-0 resize-none transition-all duration-200"
                      spellCheck={false}
                    />
                  </div>
                </div>
              </div>
              
              {parseError && (
                <div className="px-4 pb-4">
                  <div className="p-3 bg-red-50/80 backdrop-blur border border-red-200 rounded-xl text-red-700 text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {parseError}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-4 border-t border-slate-200/50 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRender}
                    className={`flex-1 px-4 py-3 font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 ${
                      isFormatValid 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600' 
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                    disabled={!isFormatValid}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    渲染表单
                  </button>
                  {parsedSchema && (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        placeholder="配置名称"
                        className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                      <button
                        onClick={handleSaveConfig}
                        disabled={isSaving || !saveName.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white font-medium rounded-lg hover:from-slate-800 hover:to-slate-900 transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md flex items-center gap-2"
                      >
                        {isSaving ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>
                        )}
                        保存
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
              <div className="p-4 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-slate-800">表单预览</h2>
                  {parsedSchema && (
                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                      {parsedSchema.widgetList.length} 个控件
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
                    <p className="text-slate-500">加载中...</p>
                  </div>
                ) : parsedSchema ? (
                  <div className="animate-fade-in">
                    <FormRenderer
                      schema={parsedSchema}
                      onSubmit={handleFormSubmit}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-center font-medium">输入或上传 JSON 配置</p>
                    <p className="text-sm mt-1">以预览表单效果</p>
                  </div>
                )}
              </div>
            </div>
            
            {submitResult && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-200/50 overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-green-200/50 bg-gradient-to-r from-green-50 to-white">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-green-800">提交成功</h3>
                  </div>
                </div>
                <div className="p-4">
                  <pre className="text-sm bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 p-4 rounded-xl overflow-auto max-h-60 font-mono">
                    {JSON.stringify(submitResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ImportPage;
