import express from 'express';
import fetch from 'node-fetch'; 
import multer from 'multer';
import { createRequire } from 'module';
import cors from 'cors'; // 🌟 新增：跨域神器

// 专治老古董包的兼容写法
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const app = express();
app.use(cors()); // 🌟 极其重要：拆掉前端和后端之间的墙，允许直连！
app.use(express.json()); 

// ... 下面的各种 app.post 接口代码完全保持原样，不用动！...

// 配置内存上传（不占用本地硬盘）
const upload = multer({ storage: multer.memoryStorage() });

// 统一的大模型调用方法 (提取了 API KEY 获取逻辑)
const getApiKey = () => process.env.ALIYUN_API_KEY || "sk-88bade1b0e174d35b06d00c7146f401b"; // ⚠️ 测试时记得换成你的真实KEY

// 🚀 新增功能：视觉大模型 (Qwen-VL) 识别截图文字
async function callQwenVL(base64Image: string, mimeType: string) {
  const response = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${getApiKey()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "qwen-vl-plus",
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } },
            { type: "text", text: "你是一个精准的 OCR 文字提取器。请提取这张招聘截图里的所有文字信息，不要做任何多余的总结和聊天，直接输出原文即可。" }
          ]
        }
      ]
    })
  });
  const data = await response.json() as any;
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
}

// 🚀 新增功能：文本大模型 (Qwen-Plus) 处理简历逻辑
async function callLLM(systemPrompt: string, userContent: string) {
  const response = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${getApiKey()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "qwen-plus",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent }
      ],
      response_format: { type: "json_object" } 
    })
  });
  const data = await response.json() as any;
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
}

// ================== 接口路由 ==================

// 📸 接口 1：上传截图，智能识别 JD
app.post('/api/parse/jd-image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "请上传图片" });
    const base64 = req.file.buffer.toString('base64');
    const text = await callQwenVL(base64, req.file.mimetype);
    res.json({ text });
  } catch (error) {
    res.status(500).json({ error: "图片识别失败，请确保图片清晰" });
  }
});

// 📄 接口 2：上传 PDF/TXT (终极绝对防御·动态剥壳版)
app.post('/api/parse/resume-file', upload.single('file'), async (req, res) => {
  console.log("Attempting to parse file...");
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    
    let text = "";
    if (req.file.mimetype === 'application/pdf') {
        console.log("File is PDF, attempting absolute force parse...");
        
        // 🌟 终极必杀技：动态加载，并用 while 循环暴力剥开所有外层包装！
        let rawModule: any = await import('pdf-parse');
        
        // 只要它不是函数，且里面还有 default 包装，就一层层扒开它！
        while (rawModule && typeof rawModule !== 'function' && rawModule.default) {
            rawModule = rawModule.default;
        }

        // 扒到最后如果还不是函数，直接抛出致命异常
        if (typeof rawModule !== 'function') {
             throw new Error("PDF底层依赖包已彻底损坏，剥壳失败！类型为：" + typeof rawModule);
        }

        // 用扒出来的真身去解析 PDF
        const data = await rawModule(req.file.buffer);
        text = data.text;
        console.log("✅ PDF parsed successfully, length:", text.length);
    } else {
        text = req.file.buffer.toString('utf-8'); 
    }
    res.json({ text });
  } catch (error: any) {
    console.error("🔥 PDF PARSE ERROR 🔥:", error); 
    res.status(500).json({ error: `解析失败: ${error.message || "未知错误"}` });
  }
});
// 🎯 接口 3：免费诱饵 - 简历诊断打分
app.post('/api/resume/analyze', async (req, res) => {
  try {
    const { jd, oldResume } = req.body;
    const systemPrompt = `你是一个严苛的大厂HR。对比用户的【旧经历】与【目标岗位JD】。
    必须返回纯 JSON 格式：
    { "score": 45, "diagnosis": "一句话无情锐评他的简历为什么会被淘汰", "missing_keywords": ["数据分析", "跨部门协同", "0到1搭建"] }`;
    const result = await callLLM(systemPrompt, `目标岗位JD:\n${jd}\n\n我的旧经历:\n${oldResume}`);
    res.json(JSON.parse(result));
  } catch (error) { res.status(500).json({ error: "诊断引擎过载" }); }
});

// 💰 接口 4：VIP 专属 - 简历降维重构 
app.post('/api/resume/rewrite', async (req, res) => {
  try {
    const { jd, oldResume, code } = req.body;
    if (code !== "vip999") return res.status(403).json({ error: "权限不足：请联系主理人获取 VIP 激活码" });
    
    const systemPrompt = `你是一个年薪百万的顶级猎头。将用户的【旧经历】重构为极具竞争力的简历以契合【目标岗位JD】。
    规则：1. 绝不凭空捏造假公司。2. 无缝融合JD高频关键词。3. 必须使用STAR法则重写。
    必须返回纯 JSON 格式：
    { "headline": "为你定制的高级岗位抬头", "rewritten_experience": "重构后的经历...", "action_advice": "面试建议..." }`;
    const result = await callLLM(systemPrompt, `目标岗位JD:\n${jd}\n\n我的旧经历:\n${oldResume}`);
    res.json(JSON.parse(result));
  } catch (error) { res.status(500).json({ error: "重构失败" }); }
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ AI 大脑与视觉引擎已成功点火！监听端口: ${PORT}`);
});