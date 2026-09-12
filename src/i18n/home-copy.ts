import type { Locale } from "./config";
const en = {
  accountMenu:"Account menu", signedInAs:"Signed in as", accountSuperuser:"Superuser", accountOwner:"Company Owner", accountAdmin:"Company Admin", accountMember:"Company Member", accountPersonal:"Personal account",
  tagline: "A little help. A lot less hassle.", badge: "FOR THE EVERYDAY AND EVERYTHING ELSE",
  title: "Make room for", accent: "a simpler day.",
  intro: "Handy tools for the things life asks of you. Find a useful checklist, organise your ideas, and keep your everyday details together — all in one place.",
  browse: "Explore the tools", signIn: "Sign in", signOut: "Sign out", workspace: "My workspace",
  how: "Small tasks. Less effort.", howIntro: "From the first idea to the last item on your list.",
  steps: [
    { title: "Find your starting point", text: "Browse by category and choose a tool that fits what you need to do." },
    { title: "Make it your own", text: "Add your details, work through your task, and turn loose information into something useful." },
    { title: "Pick up where you left off", text: "Sign in to keep your records together and come back to them when you need them." }
  ],
  categories: "Find a tool for your day", categoriesIntro: "A practical starting point, whatever is on your list.",
  all: "All categories", tools: "Available tools", open: "Open tool", noTools: "There are no tools in this category yet.",
  noCategories: "New categories are on their way. Please check back soon.",
  greeting: "Welcome back, {name}", records: "Your records", recordsIntro: "Your notes, checklists, and everyday details. Right where you left them.",
  noRecords: "A fresh start.", noRecordsText: "Choose a tool below to create your first record in this category.",
  updated: "Updated", previous: "Previous", next: "Next", create: "Create a tool",
  unavailable: "We couldn’t load your workspace. Please try again shortly.", retry: "Try again",
  catalogueUnavailable: "We couldn’t load the tools right now. Please try again shortly.",
  footer: "Useful tools. Clear thinking. Everyday progress.", email: "Email address", password: "Password",
  loginTitle: "Your everyday, organised.", loginIntro: "Sign in to return to your records and continue where you left off.",
  loginError: "We couldn’t sign you in. Check your details and try again.",
  loginUnavailable: "Sign-in is temporarily unavailable. Please try again shortly.",
  loginThrottled: "Too many attempts. Please wait a little before trying again.",
  logoutError: "We couldn’t sign you out. Please try again.", back: "Back to home", record: "Record",
  noTitle: "Untitled record", noDescription: "No description added.", total: "{count} records",
  previewLabel: "LESS TO JUGGLE", previewTitle: "Everything in its place.",
  previewItems: ["A plan for your next project", "A checklist for your home", "Notes for your next adventure"],
  previewFoot: "Find your tool. Take the next step.", values: "Your details", skip: "Skip to content"
};
const zh: typeof en = {
  accountMenu:"账户菜单", signedInAs:"当前登录账户", accountSuperuser:"超级用户", accountOwner:"公司所有者", accountAdmin:"公司管理员", accountMember:"公司成员", accountPersonal:"个人账户",
  tagline: "小小帮手，让生活轻松一点。", badge: "为日常大小事准备",
  title: "让每一天", accent: "简单一点。",
  intro: "为生活中的大小事提供实用工具。找到合适的清单，整理想法，把日常信息收在一处。",
  browse: "探索工具", signIn: "登录", signOut: "退出登录", workspace: "我的工作台",
  how: "日常小事，轻松完成。", howIntro: "从最初的想法，到清单上的最后一项。",
  steps: [
    { title: "找到起点", text: "按分类浏览，选择适合当前任务的工具。" },
    { title: "加入你的内容", text: "填写信息，逐步完成任务，让零散的内容变得有条理。" },
    { title: "随时继续", text: "登录后集中管理记录，需要时随时回来继续。" }
  ],
  categories: "找到今天需要的工具", categoriesIntro: "无论计划做什么，都有一个实用的起点。",
  all: "全部分类", tools: "可用工具", open: "打开工具", noTools: "这个分类暂时没有工具。",
  noCategories: "更多分类正在准备中，请稍后再来看看。",
  greeting: "欢迎回来，{name}", records: "你的记录", recordsIntro: "笔记、清单和日常信息，都在这里等你继续。",
  noRecords: "从这里开始。", noRecordsText: "选择下方工具，创建这个分类下的第一条记录。",
  updated: "更新于", previous: "上一页", next: "下一页", create: "创建工具",
  unavailable: "暂时无法加载工作台，请稍后重试。", retry: "重试",
  catalogueUnavailable: "暂时无法加载工具，请稍后重试。", footer: "实用工具，清晰思路，让日常更有条理。",
  email: "电子邮箱", password: "密码", loginTitle: "让日常井井有条。",
  loginIntro: "登录查看记录，接着上次的进度继续。",
  loginError: "登录失败，请检查登录信息后重试。", loginUnavailable: "暂时无法登录，请稍后重试。",
  loginThrottled: "尝试次数过多，请稍等片刻再试。", logoutError: "退出登录失败，请重试。",
  back: "返回首页", record: "记录", noTitle: "未命名记录", noDescription: "尚未添加描述。",
  total: "{count} 条记录", previewLabel: "少一分忙乱", previewTitle: "各归其位，心中有序。",
  previewItems: ["下一个项目的计划", "家居事务检查清单", "下一次旅行的笔记"],
  previewFoot: "找到工具，迈出下一步。", values: "记录详情", skip: "跳至正文"
};
export function homeCopy(locale: Locale) { return locale === "zh-Hans" ? zh : en; }
export type HomeCopy = typeof en;
