import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings, Key } from "lucide-react";

export interface SettingsType {
  apiKey: string;
  model: string;
}

// 🛡️ 商业版安全底线：绝对不能在这里写任何 sk- 开头的真实密钥！
export const DEFAULT_SETTINGS: SettingsType = {
  apiKey: "", 
  model: "qwen-plus"
};

export function SettingsModal({ onSettingsChange }: { onSettingsChange?: (s: SettingsType) => void }) {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");

  // 打开弹窗时，读取之前保存在手机/电脑里的激活码
  useEffect(() => {
    if (open) {
      const savedKey = localStorage.getItem("user_api_key");
      if (savedKey) {
        setApiKey(savedKey);
      }
    }
  }, [open]);

  const handleSave = () => {
    if (!apiKey) {
      alert("请填写激活码解锁 AI 功能！");
      return;
    }
    
    // 核心：把用户输入的“激活码”存到浏览器的口袋里
    localStorage.setItem("user_api_key", apiKey);
    
    // 通知页面状态更新
    if (onSettingsChange) {
      onSettingsChange({ apiKey, model: "qwen-plus" });
    }
    
    alert("激活码配置成功！快去试试高级 AI 算力吧！");
    setOpen(false);
    
    // 强制刷新页面确保所有组件读到最新的激活码（兼容你的旧逻辑）
    window.location.reload(); 
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-yellow-500 hover:bg-zinc-800 transition-colors">
          <Settings className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border border-yellow-600/50 text-white sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-500 text-xl font-bold">
            <Key className="w-5 h-5" />
            解锁高级 AI 算力
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="apiKey" className="text-zinc-300 font-bold text-sm">
              VIP 专属激活码
            </Label>
            <Input
              id="apiKey"
              type="password"  
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="请输入主理人发放的激活码..."
              className="bg-black border-zinc-800 focus:border-yellow-500 text-yellow-500 font-mono tracking-wider"
            />
            <div className="mt-3 text-xs text-zinc-400 bg-zinc-900/80 p-3 rounded border border-zinc-800 leading-relaxed">
              💡 <strong className="text-zinc-300">获取方式：</strong><br/>
              请添加主理人微信：<strong className="text-yellow-500 text-sm">X79Y99</strong> <br/>
              添加时请备注“AI记账”，获取测试激活码或购买月度套餐。
            </div>
          </div>
        </div>
        
        <Button onClick={handleSave} className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold text-lg mt-2">
          保存并验证
        </Button>
      </DialogContent>
    </Dialog>
  );
}
