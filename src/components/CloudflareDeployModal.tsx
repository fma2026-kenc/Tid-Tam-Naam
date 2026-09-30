import React, { useState } from 'react';
import {
  X,
  Cloud,
  FileCode,
  Copy,
  Check,
  Download,
  Upload,
  ShieldCheck,
  Server,
  Database,
  Terminal,
} from 'lucide-react';
import { exportPreferencesJSON, importPreferencesJSON } from '../utils/storage';

interface CloudflareDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
}

export const CloudflareDeployModal: React.FC<CloudflareDeployModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
}) => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string>('');

  if (!isOpen) return null;

  const headersSnippet = `# Cloudflare Pages _headers file
# Placed in the build output / public root directory

/*
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization
  Content-Security-Policy: default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; frame-src 'self' https: http:; img-src 'self' https: data: blob:; connect-src 'self' https: wss:; font-src 'self' https: data:; style-src 'self' 'unsafe-inline' https:;

/assets/*
  Cache-Control: public, max-age=31536000, immutable`;

  const wranglerSnippet = `# wrangler.toml configuration for Cloudflare Pages / Workers
name = "tid-tam-naam"
compatibility_date = "2026-09-29"
pages_build_output_dir = "dist"

# Optional Cloudflare KV Namespace for syncing user default pinned links
# [[kv_namespaces]]
# binding = "USER_PREFERENCES_KV"
# id = "<YOUR_KV_NAMESPACE_ID>"

[vars]
ENVIRONMENT = "production"
APP_NAME = "Tid-Tam-Naam (ติดตามน้ำ)"`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(id);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownloadBackup = () => {
    const json = exportPreferencesJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tid-tam-naam-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importPreferencesJSON(content);
        if (ok) {
          setImportStatus('นำเข้าข้อมูลสำเร็จ!');
          onRefreshData();
          setTimeout(() => setImportStatus(''), 3000);
        } else {
          setImportStatus('ไฟล์ JSON ไม่ถูกต้อง');
          setTimeout(() => setImportStatus(''), 3000);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl md:rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                สถาปัตยกรรม & การติดตั้ง Cloudflare Ecosystem
              </h3>
              <p className="text-xs text-slate-500">
                Cloudflare Pages, Workers, KV Storage และการตั้งค่าความปลอดภัย
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs md:text-sm">
          {/* Architecture Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100">
              <div className="flex items-center gap-2 text-[#0077B6] font-bold text-xs mb-1">
                <Server className="w-4 h-4" />
                <span>Cloudflare Pages</span>
              </div>
              <p className="text-[11px] text-slate-600">
                โฮสต์เว็บระดับ Edge 300+ เมืองทั่วโลก โหลดไวในไทยและทุกภูมิภาค
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
                <Database className="w-4 h-4" />
                <span>Cloudflare KV / Local</span>
              </div>
              <p className="text-[11px] text-slate-600">
                จัดเก็บรายการลิงค์ส่วนตัวและหน้าเริ่มต้นประจำหมวดของผู้ใช้
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>_headers & CSP</span>
              </div>
              <p className="text-[11px] text-slate-600">
                ความปลอดภัยสูง รองรับการฝัง iframe และอนุญาตสตรีมภาพกล้องสด
              </p>
            </div>
          </div>

          {/* Configuration Snippets */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-[#0077B6]" />
                  ไฟล์ <code>public/_headers</code> (Security Headers & CORS)
                </span>
                <button
                  onClick={() => copyToClipboard(headersSnippet, 'headers')}
                  className="flex items-center gap-1 text-xs text-[#0077B6] hover:underline font-medium min-h-[32px]"
                >
                  {copiedFile === 'headers' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอกโค้ด</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto leading-relaxed">
                {headersSnippet}
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-amber-600" />
                  ไฟล์ <code>wrangler.toml</code> (Cloudflare Configuration)
                </span>
                <button
                  onClick={() => copyToClipboard(wranglerSnippet, 'wrangler')}
                  className="flex items-center gap-1 text-xs text-[#0077B6] hover:underline font-medium min-h-[32px]"
                >
                  {copiedFile === 'wrangler' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอกโค้ด</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto leading-relaxed">
                {wranglerSnippet}
              </pre>
            </div>
          </div>

          {/* Backup & Sync Preferences */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 text-xs mb-1">
              สำรองข้อมูลและการซิงค์การตั้งค่า (Backup & KV Sync)
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">
              คุณสามารถดาวน์โหลดรายการลิงค์ส่วนตัวและการปักหมุดหน้าเริ่มต้นไปใช้บนอุปกรณ์อื่นได้ทันที
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleDownloadBackup}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs min-h-[40px]"
              >
                <Download className="w-4 h-4 text-[#0077B6]" />
                <span>ดาวน์โหลดไฟล์สำรอง (JSON)</span>
              </button>

              <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs cursor-pointer min-h-[40px]">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>กู้คืนข้อมูลจากไฟล์ (JSON)</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {importStatus && (
                <span className="text-xs font-semibold text-emerald-700 animate-in fade-in">
                  {importStatus}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs md:text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors min-h-[40px]"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
