export function adminCopy(lang: string) {
 return lang === "zh-Hans" ? {
 title:"管理中心", users:"用户", companies:"公司", categories:"分类", intro:"管理账户、公司和工具分类。",
 search:"搜索", save:"保存", saving:"正在保存…", saved:"已保存", failed:"无法保存。请检查字段，或刷新后重试。",
 forbidden:"需要超级用户权限。", unavailable:"暂时无法加载管理数据。", create:"新建分类", edit:"编辑", active:"启用",
 displayName:"姓名", name:"名称", email:"电子邮箱", phone:"电话或手机（选填）", preferredLanguage:"语言",
 companyId:"公司 ID（个人账户留空）", companyRole:"公司角色", accountTypeId:"账户方案", isSuperAdmin:"超级用户",
 country:"国家（选填）", address:"地址（选填）", websiteUrl:"网站（选填）", seatLimit:"席位数", expiresAt:"到期时间（UTC，选填）",
 description:"描述", displayOrder:"显示顺序", masterCategoryId:"主分类 ID", master:"主分类", sub:"子分类",
 personal:"个人账户／无", browser:"跟随浏览器", member:"成员", owner:"所有者", admin:"管理员",
 previous:"上一页", next:"下一页", empty:"没有匹配的条目。", results:"条记录", hint:"身份或权限变更将注销该用户的现有会话。公司用户继承公司方案。",
 enName:"英文名称（选填）", enDescription:"英文描述（选填）", zhName:"中文名称（选填）", zhDescription:"中文描述（选填）",
 conflict:"无法保存：条目已更改、名称重复、席位不足，或会移除最后一位管理员。请检查后重试。"
 } : {
 title:"Administration", users:"Users", companies:"Companies", categories:"Categories", intro:"Manage accounts, companies, and tool categories.",
 search:"Search", save:"Save", saving:"Saving…", saved:"Saved", failed:"Could not save. Check the fields, or reload and try again.",
 forbidden:"Superuser access is required.", unavailable:"Administration data is temporarily unavailable.", create:"New category", edit:"Edit", active:"Active",
 displayName:"Name", name:"Name", email:"Email", phone:"Phone or mobile (optional)", preferredLanguage:"Language",
 companyId:"Company ID (blank for personal)", companyRole:"Company role", accountTypeId:"Account plan", isSuperAdmin:"Superuser",
 country:"Country (optional)", address:"Address (optional)", websiteUrl:"Website (optional)", seatLimit:"Seat limit", expiresAt:"Expiry (UTC, optional)",
 description:"Description", displayOrder:"Display order", masterCategoryId:"Master category ID", master:"Master categories", sub:"Subcategories",
 personal:"Personal / none", browser:"Browser default", member:"Member", owner:"Owner", admin:"Admin",
 previous:"Previous", next:"Next", empty:"No matching entries.", results:"entries", hint:"Identity or access changes sign this user out of existing sessions. Company users inherit their company plan.",
 enName:"English name (optional)", enDescription:"English description (optional)", zhName:"Chinese name (optional)", zhDescription:"Chinese description (optional)",
 conflict:"Could not save: the entry changed, a name is duplicated, seats are full, or the last administrator would be removed."
 };
}
