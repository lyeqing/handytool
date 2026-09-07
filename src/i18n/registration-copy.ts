import type { Locale } from "./config";

const en = {
  title: "A simpler day starts here.",
  intro: "Create your free Handytool account and keep your everyday details together.",
  register: "Register", create: "Create free account", pending: "Creating your account…",
  free: "Free account · No payment required", kind: "Account type",
  personal: "Personal", company: "Company", personalHint: "A workspace for your own records.",
  companyHint: "A shared company workspace. You’ll be its first account administrator (Owner).",
  name: "Your name", email: "Email address", password: "Password", phone: "Phone or mobile",
  passwordHint: "Use at least 8 characters.", optional: "optional",
  companyDetails: "Company details", companyName: "Company name", country: "Country",
  address: "Company address", websiteUrl: "Company website", websiteHint: "Include https:// or http://.",
  existing: "Already have an account?", signIn: "Sign in", newAccount: "New to Handytool?",
  back: "Back to home", errorTitle: "Please check your details.",
  unavailable: "Registration is temporarily unavailable. Please try again shortly.",
  throttled: "Too many attempts. Please wait a little before trying again.",
  duplicate: "This email is already registered. Sign in with your existing account.",
  required: "This field is required.", tooLong: "This value is too long.",
  tooShort: "Choose a longer password.", invalid: "Please check this value.",
  invalidEmail: "Enter a valid email address.", invalidWebsite: "Enter an http:// or https:// website URL.",
};
const zh: typeof en = {
  title: "从这里开始，让日常更简单。",
  intro: "免费创建 Handytool 账户，把日常信息有条理地收在一处。",
  register: "注册", create: "创建免费账户", pending: "正在创建账户…",
  free: "免费账户 · 无需付款", kind: "账户类型",
  personal: "个人", company: "公司", personalHint: "管理个人记录的工作台。",
  companyHint: "创建公司工作台。你将成为首位账户管理员（Owner），此角色不代表企业的法律所有权。",
  name: "你的姓名", email: "电子邮箱", password: "密码", phone: "电话或手机",
  passwordHint: "请使用至少 8 个字符。", optional: "选填",
  companyDetails: "公司信息", companyName: "公司名称", country: "国家或地区",
  address: "公司地址", websiteUrl: "公司网站", websiteHint: "请包含 https:// 或 http://。",
  existing: "已有账户？", signIn: "登录", newAccount: "初次使用 Handytool？",
  back: "返回首页", errorTitle: "请检查填写的信息。",
  unavailable: "暂时无法注册，请稍后重试。", throttled: "尝试次数过多，请稍后重试。",
  duplicate: "此邮箱已注册，请登录现有账户。",
  required: "此项为必填项。", tooLong: "内容过长。", tooShort: "请使用更长的密码。",
  invalid: "请检查此项。", invalidEmail: "请输入有效的电子邮箱。", invalidWebsite: "请输入以 http:// 或 https:// 开头的网址。",
};
export type RegistrationCopy = typeof en;
export function registrationCopy(locale: Locale): RegistrationCopy { return locale === "zh-Hans" ? zh : en; }
