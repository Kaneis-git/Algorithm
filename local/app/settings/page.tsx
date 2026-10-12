import { SiteHeader } from "@/components/layout/SiteHeader";
export const dynamic = "force-dynamic";
export const metadata = { title: "服务配置 · KnowledgeHub AI" };
export default function SettingsPage() {
  const web = process.env.WEB_SEARCH_PROVIDER || "bocha";
  const video = process.env.VIDEO_SEARCH_PROVIDER || "bilibili";
  const hasWeb = web === "bocha" ? !!process.env.BOCHA_API_KEY : web === "tavily" && !!process.env.TAVILY_API_KEY;
  const rows = [
    ["GitHub", process.env.GITHUB_ENABLED === "false" ? "已关闭" : process.env.GITHUB_TOKEN ? "已填写 Token" : "匿名搜索", "GITHUB_TOKEN（可选）；设置 GITHUB_ENABLED=false 可关闭。"],
    ["网页与 PPT", web === "none" ? "已关闭" : hasWeb ? "已填写密钥" : "待配置", "默认 WEB_SEARCH_PROVIDER=bocha，填写 BOCHA_API_KEY；也可选择 tavily 并填写 TAVILY_API_KEY。"],
    ["视频", video === "none" ? "已关闭" : video === "bilibili" ? hasWeb ? "已配置网页索引" : "等待网页搜索配置" : process.env.YOUTUBE_API_KEY ? "已填写密钥" : "待配置", "默认 VIDEO_SEARCH_PROVIDER=bilibili，复用网页搜索；可选 youtube 与 YOUTUBE_API_KEY。"],
    ["AI", process.env.AI_ENABLED === "false" ? "已关闭" : process.env.AI_API_KEY ? "已填写密钥" : process.env.AI_ALLOW_NO_KEY === "true" ? "请检查本机模型地址" : "待配置", "填写 AI_BASE_URL、AI_API_KEY、AI_MODEL。默认兼容 DeepSeek Chat Completions。"],
    ["本机数据", "自动创建", "历史、收藏、缓存默认位于项目目录 data/knowledgehub.db。修改 DATABASE_PATH 可指定其他目录。"],
  ];
  return <main className="min-h-screen bg-[#f6f8f5]"><SiteHeader compact /><div className="mx-auto max-w-4xl space-y-6 px-5 pb-20 pt-6 sm:px-8"><h1 className="text-3xl font-black text-emerald-950">服务配置</h1><p className="text-sm leading-7 text-slate-600">首次使用时，把项目中的 .env.example 复制为 .env.local，填写所需密钥后重新启动网站。这里仅显示是否已填写，不展示密钥，也不代表服务已连通；搜索页会显示每个来源的实际调用状态。</p><div className="space-y-4">{rows.map(([name, status, help]) => <section key={name} className="rounded-2xl border border-emerald-100 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold text-emerald-950">{name}</h2><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-800">{status}</span></div><p className="mt-3 break-words text-sm leading-6 text-slate-600">{help}</p></section>)}</div><p className="rounded-2xl bg-amber-50 p-5 text-sm leading-6 text-amber-900">使用外部搜索与 AI 时，搜索主题及用于总结的资源标题/摘要会发送给你配置的服务，服务可能按调用计费。网站、历史和收藏运行在本机；在线搜索仍需要网络。详细参数与本地模型配置见源码包 README.md。</p></div></main>;
}
