import { SiteHeader } from "@/components/layout/SiteHeader";
export const dynamic = "force-dynamic";
export const metadata = { title: "服务配置 · KnowledgeHub AI" };
export default function SettingsPage() {
  const web = process.env.WEB_SEARCH_PROVIDER || "bocha";
  const video = process.env.VIDEO_SEARCH_PROVIDER || "bilibili";
  const hasWeb = web === "bocha" ? !!process.env.BOCHA_API_KEY : web === "tavily" && !!process.env.TAVILY_API_KEY;
  const rows = [
    ["GitHub", process.env.GITHUB_ENABLED === "false" ? "已关闭" : process.env.GITHUB_TOKEN ? "已填写 Token" : "匿名搜索", "可配置 GITHUB_TOKEN；只搜索公开仓库。"],
    ["网页与 PPT", hasWeb ? "已填写密钥" : "待配置", "默认使用博查，需要 BOCHA_API_KEY；可切换 WEB_SEARCH_PROVIDER=tavily 并填写 TAVILY_API_KEY。"],
    ["视频", video === "bilibili" && hasWeb ? "已配置网页索引" : process.env.YOUTUBE_API_KEY ? "已填写密钥" : "待配置", "默认从搜索服务索引中查找哔哩哔哩视频；可选 YouTube。"],
    ["AI", process.env.AI_ENABLED === "false" ? "已关闭" : process.env.AI_API_KEY ? "已填写密钥" : "待配置", "配置 AI_BASE_URL、AI_API_KEY、AI_MODEL；默认兼容 DeepSeek。未配置时使用规则扩展。"],
    ["历史与收藏", "云端保存", "保存在当前站点中，按登录账户隔离。与你电脑上的本机版数据独立。"],
  ];
  return <main className="min-h-screen bg-[#f6f8f5]"><SiteHeader compact /><div className="mx-auto max-w-4xl space-y-6 px-5 pb-20 pt-6 sm:px-8"><h1 className="text-3xl font-black text-emerald-950">服务配置</h1><p className="text-sm leading-7 text-slate-600">这是在线版，无需填写本地 IP 或启动电脑上的服务。服务密钥由站点所有者在运行配置中设置；这里仅显示是否已填写，实际连通情况以搜索结果页为准。</p><div className="space-y-4">{rows.map(([name, status, help]) => <section key={name} className="rounded-2xl border border-emerald-100 bg-white p-5"><div className="flex items-center justify-between gap-3"><h2 className="font-bold text-emerald-950">{name}</h2><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-800">{status}</span></div><p className="mt-3 text-sm leading-6 text-slate-600">{help}</p></section>)}</div><p className="rounded-2xl bg-amber-50 p-5 text-sm leading-6 text-amber-900">在线搜索会把主题发送给配置的搜索服务。AI 总结还会发送资源标题与摘要，服务可能按调用计费。没有配置密钥的功能会明确提示。</p></div></main>;
}
