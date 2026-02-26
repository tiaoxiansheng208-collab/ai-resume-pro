import React, { useState, useRef } from "react";
import { Target, FileText, Crosshair, Lock, Sparkles, AlertTriangle, CheckCircle, Loader2, Key, Image as ImageIcon, UploadCloud, Copy } from "lucide-react";

export default function ResumeSniperPage() {
  const [jd, setJd] = useState("");
  const [oldResume, setOldResume] = useState("");
  const [vipCode, setVipCode] = useState("");
  const [showVipModal, setShowVipModal] = useState(false);

  const [isParsingJd, setIsParsingJd] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [isParsingResumeImg, setIsParsingResumeImg] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);

  const [analysis, setAnalysis] = useState<any>(null);
  const [rewrittenData, setRewrittenData] = useState<any>(null);

  const [toastMsg, setToastMsg] = useState<{title:string, desc?:string, isError?:boolean} | null>(null);
  const showToast = (title: string, desc?: string, isError: boolean = false) => {
    setToastMsg({title, desc, isError});
    setTimeout(() => setToastMsg(null), 4000);
  };

  const jdInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const resumeImgInputRef = useRef<HTMLInputElement>(null);

  const safeFetch = async (endpoint: string, options: any) => {
    const url = `http://localhost:5000${endpoint}`;
    let res;
    try {
        res = await fetch(url, options);
    } catch (err) {
        throw new Error("后端大脑失联！请确认黑窗口里的 npx tsx server/index.ts 正在运行！");
    }
    const text = await res.text();
    if (!res.ok) throw new Error(`后端拦截 (状态码: ${res.status}) - 请检查后端控制台`);
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`系统异常，返回了非格式化数据！`);
    }
  };

  // 🌟 新增功能 2：“最后一公里”一键复制功能
  const copyToClipboard = async (text: string, typeName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("复制成功！", `${typeName}已复制，快去粘贴到你的简历中吧！`);
    } catch (err) {
      showToast("复制失败", "请手动划选文本复制", true);
    }
  };

  const handleJdUpload = async (e: any) => {
    const file = e.target.files[0];
    if(!file) return;
    setIsParsingJd(true);
    const formData = new FormData(); formData.append('file', file);
    try {
      const data = await safeFetch('/api/parse/jd-image', { method: 'POST', body: formData });
      if(data.error) throw new Error(data.error);
      setJd(data.text);
      showToast("识别成功", "JD文字已自动填入");
    } catch(err:any) { showToast("识别失败", err.message, true); }
    finally { setIsParsingJd(false); }
  };

  const handleResumeImgUpload = async (e: any) => {
    const file = e.target.files[0];
    if(!file) return;
    setIsParsingResumeImg(true);
    const formData = new FormData(); formData.append('file', file);
    try {
      const data = await safeFetch('/api/parse/jd-image', { method: 'POST', body: formData });
      if(data.error) throw new Error(data.error);
      setOldResume(data.text);
      showToast("识别成功", "简历截图已转化为文字");
    } catch(err:any) { showToast("识别失败", err.message, true); }
    finally { setIsParsingResumeImg(false); }
  };

  const handleResumeUpload = async (e: any) => {
    const file = e.target.files[0];
    if(!file) return;
    setIsParsingResume(true);
    const formData = new FormData(); formData.append('file', file);
    try {
      const data = await safeFetch('/api/parse/resume-file', { method: 'POST', body: formData });
      if(data.error) throw new Error(data.error);
      setOldResume(data.text);
      showToast("解析成功", "简历文字已自动提取");
    } catch(err:any) { showToast("解析失败", err.message, true); }
    finally { setIsParsingResume(false); }
  };

  const handleAnalyze = async () => {
    if (!jd || !oldResume) return showToast("请填写完整", "必须提供岗位JD和简历", true);
    setIsAnalyzing(true);
    try {
      const data = await safeFetch('/api/resume/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jd, oldResume })
      });
      if(data.error) throw new Error(data.error);
      setAnalysis(data); showToast("诊断完成！");
    } catch (err: any) { showToast("诊断引擎过载", err.message, true); }
    finally { setIsAnalyzing(false); }
  };

  const handleRewrite = async () => {
    if (!vipCode) { setShowVipModal(true); return; }
    setIsRewriting(true);
    try {
      const data = await safeFetch('/api/resume/rewrite', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jd, oldResume, code: vipCode })
      });
      if (data.error) throw new Error(data.error || "激活码无效");
      setRewrittenData(data); setShowVipModal(false); showToast("爆改成功！简历已全面重构");
    } catch (err: any) { setShowVipModal(true); showToast("拦截警告", err.message, true); }
    finally { setIsRewriting(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-10 relative flex flex-col">
      {toastMsg && (
        <div className={`fixed top-20 right-4 z-[9999] px-6 py-4 rounded-lg shadow-2xl border transition-all animate-in slide-in-from-top-5 ${toastMsg.isError ? 'bg-red-950/90 border-red-900 text-red-200' : 'bg-slate-900/90 border-slate-700 text-slate-200'}`}>
          <h4 className="font-bold text-sm">{toastMsg.title}</h4>
          {toastMsg.desc && <p className="text-xs opacity-80 mt-1">{toastMsg.desc}</p>}
        </div>
      )}

      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white"><Crosshair size={18} /></div>
            <h1 className="font-bold text-lg">AI 简历狙击手 <span className="text-slate-500 text-xs">PRO</span></h1>
          </div>
          <button onClick={() => setShowVipModal(true)} className="border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-1.5 rounded text-sm flex items-center transition-colors">
            <Key className="w-4 h-4 mr-2" /> 获取 VIP 密钥
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 flex-1">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2 text-blue-400 font-bold"><Target className="w-5 h-5" /> 锁定猎物 (目标岗位 JD)</div>
              <input type="file" ref={jdInputRef} onChange={handleJdUpload} accept="image/*" className="hidden" />
              <button onClick={() => jdInputRef.current?.click()} disabled={isParsingJd} className="bg-blue-900/50 hover:bg-blue-800 text-blue-200 px-3 py-1.5 rounded text-sm flex items-center transition-colors disabled:opacity-50">
                {isParsingJd ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />} 传截图识别
              </button>
            </div>
            <div className="p-4">
              <textarea placeholder="模式1：直接手动粘贴JD文字。&#10;模式2：点击右上角上传Boss直聘/拉勾截图，AI会自动提取文字..." className="min-h-[150px] w-full rounded border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" value={jd} onChange={e => setJd(e.target.value)} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-300 font-bold"><FileText className="w-5 h-5" /> 我的底牌 (旧经历)</div>
              
              <div className="flex gap-2">
                <input type="file" ref={resumeImgInputRef} onChange={handleResumeImgUpload} accept="image/*" className="hidden" />
                <button onClick={() => resumeImgInputRef.current?.click()} disabled={isParsingResumeImg} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded text-xs flex items-center transition-colors disabled:opacity-50" title="上传旧简历的截图">
                  {isParsingResumeImg ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <ImageIcon className="w-3 h-3 mr-1" />} 传截图
                </button>

                <input type="file" ref={resumeInputRef} onChange={handleResumeUpload} accept=".pdf,.txt" className="hidden" />
                <button onClick={() => resumeInputRef.current?.click()} disabled={isParsingResume} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded text-xs flex items-center transition-colors disabled:opacity-50" title="上传PDF或TXT文件">
                  {isParsingResume ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <UploadCloud className="w-3 h-3 mr-1" />} 传文件
                </button>
              </div>
            </div>
            <div className="p-4">
              <textarea placeholder="模式1：全选旧简历，直接粘贴到这里（推荐最快）。&#10;模式2：上传简历截图。&#10;模式3：上传PDF或TXT文件..." className="min-h-[150px] w-full rounded border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" value={oldResume} onChange={e => setOldResume(e.target.value)} />
              <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded flex justify-center items-center transition-colors disabled:opacity-50">
                {isAnalyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> AI 扫描中...</> : "免费诊断简历存活率 🔍"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {analysis && (
            <div className="rounded-xl border border-red-900/50 bg-slate-900 shadow-xl p-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-start mb-6">
                <div><h3 className="text-slate-400 text-sm mb-1">机扫存活率预测</h3><div className="text-4xl font-black text-red-500">{analysis.score} <span className="text-lg text-red-500/50">/100</span></div></div>
                <div className="px-2.5 py-1 rounded border border-red-500/20 bg-red-500/10 text-red-500 text-xs font-bold flex items-center"><AlertTriangle className="w-3 h-3 mr-1" /> 极易被淘汰</div>
              </div>
              <div className="p-3 bg-red-950/30 rounded border border-red-900/50 text-sm text-red-200 mb-4 leading-relaxed">“{analysis.diagnosis}”</div>
              <div className="flex flex-wrap gap-2">
                {analysis.missing_keywords.map((kw: string, i: number) => (
                  <div key={i} className="px-2.5 py-0.5 rounded border border-red-500/30 bg-slate-950 text-red-400 text-xs">{kw}</div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-blue-900/50 bg-slate-900 shadow-xl overflow-hidden relative min-h-[300px]">
            {!rewrittenData && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                <Lock className="w-12 h-12 text-blue-500/50 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">一键重构高薪简历</h3>
                <button onClick={handleRewrite} disabled={!analysis || isRewriting} className="bg-blue-600 hover:bg-blue-500 text-white font-bold w-full max-w-xs mt-4 py-2.5 rounded shadow-lg shadow-blue-900/50 flex justify-center items-center disabled:opacity-50 transition-colors">
                  {isRewriting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-2" /> 注入 VIP 算力</>}
                </button>
              </div>
            )}
            <div className="p-4 border-b border-slate-800 text-blue-400 font-bold flex justify-between items-center bg-blue-950/20">
              <span className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> 终极狙击版本</span>
            </div>
            
            <div className="p-6">
              {rewrittenData && (
                <div className="animate-in fade-in zoom-in-95 duration-500">
                  {/* 🌟 附带复制按钮的 Headline */}
                  <div className="flex justify-between items-start mb-4 group">
                    <h2 className="text-xl font-black text-white border-l-4 border-blue-500 pl-3 flex-1 pr-4">{rewrittenData.headline}</h2>
                    <button onClick={() => copyToClipboard(rewrittenData.headline, '核心定位')} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded transition-all opacity-0 group-hover:opacity-100" title="复制定位">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 🌟 附带悬浮复制按钮的经历区 */}
                  <div className="relative group mb-6">
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-sm text-slate-300 whitespace-pre-line leading-relaxed font-mono">
                      {rewrittenData.rewritten_experience}
                    </div>
                    <button onClick={() => copyToClipboard(rewrittenData.rewritten_experience, '重构经历')} className="absolute top-2 right-2 px-3 py-1.5 bg-slate-800 rounded shadow border border-slate-700 hover:bg-blue-600 hover:border-blue-500 text-slate-300 hover:text-white transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs font-bold">
                      <Copy className="w-3 h-3"/> 一键复制
                    </button>
                  </div>

                  <div className="text-xs text-blue-300 bg-blue-950/30 p-3 rounded border border-blue-900/50 relative group">
                    <span className="absolute top-2 right-2 cursor-pointer text-blue-500/50 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(rewrittenData.action_advice, '面试建议')} title="复制建议"><Copy className="w-3 h-3"/></span>
                    💡 <strong className="text-blue-400">面试必杀技：</strong> {rewrittenData.action_advice}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 🌟 新增功能 3：底部的隐私信任背书 */}
      <footer className="mt-8 pb-4 text-center">
        <p className="text-xs text-slate-600 flex items-center justify-center gap-1 font-mono">
          <Lock className="w-3 h-3" /> 您的数据仅用于本次 AI 运算，系统阅后即焚，绝不存储任何个人隐私。
        </p>
      </footer>

      {showVipModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-blue-600/50 text-white w-full max-w-[420px] rounded-xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h2 className="flex items-center gap-2 text-blue-500 text-xl font-bold"><Key className="w-5 h-5" /> 解锁高级 AI 猎头</h2>
              <button onClick={() => setShowVipModal(false)} className="text-slate-500 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            
            <div className="space-y-5">
              {/* 🌟 新增功能 1：变现引流路径设计（体验卡/次卡引流） */}
              <div className="bg-blue-950/30 border border-blue-900/50 p-4 rounded-lg text-sm text-blue-200 leading-relaxed shadow-inner">
                <p className="font-bold mb-1 text-blue-400">🔥 注入顶级 AI 算力，让简历脱颖而出！</p>
                <p className="text-xs text-blue-300/80 mb-3">单次深度重构需要消耗大量专属大模型算力资源。如果您还没有激活码，请添加主理人获取：</p>
                
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded border border-slate-800">
                  {/* 老板，把这里换成你的微信号！ */}
                  <span className="font-mono text-white tracking-wider flex items-center gap-2">微信: <span className="text-green-400 font-bold select-all">X79Y99</span></span>
                  <span className="text-xs font-bold bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-800">限时 9.9元/次</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-bold text-sm">VIP 专属激活码</label>
                <input type="password" value={vipCode} onChange={(e) => setVipCode(e.target.value)} placeholder="请输入您购买的激活码..." className="w-full bg-black border border-slate-800 rounded px-3 py-3 text-blue-500 font-mono tracking-wider focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <button onClick={handleRewrite} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg py-3 rounded shadow-lg shadow-blue-900/50 transition-colors">
                验证并执行重构
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}