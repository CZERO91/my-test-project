import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import FormRenderer from '../components/FormRenderer';
import type { FormSchema } from '../types/schema';
import { loadFormConfig } from '../lib/supabase';

const RendererPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const configId = searchParams.get('config');
  
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<any>(null);
  
  useEffect(() => {
    if (configId) {
      loadSchema(configId);
    }
  }, [configId]);
  
  const loadSchema = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const config = await loadFormConfig(id);
      if (config) {
        setSchema(config.config);
      } else {
        setError('未找到配置');
      }
    } catch (err) {
      setError('加载配置失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = useCallback((data: Record<string, any>) => {
    console.log('Form submitted:', data);
    setSubmitResult(data);
  }, []);
  
  const handleReset = useCallback(() => {
    setSubmitResult(null);
  }, []);
  
  if (!configId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">缺少配置参数</h2>
          <p className="text-slate-500 mb-4">请在 URL 中提供 config 参数</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首页
          </Link>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">加载中...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">{error}</h2>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首页
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">表单渲染器</h1>
                <p className="text-sm text-slate-500">配置 ID: {configId.slice(0, 8)}...</p>
              </div>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6">
            {schema && (
              <FormRenderer
                schema={schema}
                onSubmit={handleSubmit}
                onReset={handleReset}
              />
            )}
          </div>
        </div>
        
        {submitResult && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-slate-200 bg-green-50">
              <h3 className="text-lg font-semibold text-green-800">提交成功</h3>
            </div>
            <div className="p-4">
              <pre className="text-sm bg-slate-900 text-slate-100 p-4 rounded-xl overflow-auto max-h-60">
                {JSON.stringify(submitResult, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RendererPage;
