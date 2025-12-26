# 🔍 百度和 Google 搜索引擎收录完整指南

## 📋 已完成的 SEO 基础配置

### ✅ 1. SEO Meta 标签（已添加到 index.html）
- 完整的 description 和 keywords
- Open Graph 标签（社交分享优化）
- Twitter Card 标签
- Canonical URL
- Robots meta 标签

### ✅ 2. sitemap.xml（已创建）
- 位置：`public/sitemap.xml`
- 包含所有主要页面
- 访问地址：https://wallpaper.061129.xyz/sitemap.xml

### ✅ 3. robots.txt（已创建）
- 位置：`public/robots.txt`
- 允许所有搜索引擎抓取
- 访问地址：https://wallpaper.061129.xyz/robots.txt

---

## 🌐 Google 搜索引擎收录步骤

### 第 1 步：提交网站到 Google Search Console

1. **访问 Google Search Console**
   - 网址：https://search.google.com/search-console

2. **添加资源**
   - 点击"添加资源"
   - 选择"网址前缀"
   - 输入：`https://wallpaper.061129.xyz`

3. **验证所有权**（选择一种方法）

   **方法 A：HTML 文件验证（推荐）**
   ```bash
   # Google 会提供一个验证文件，下载后放到 public/ 目录
   # 例如：google1234567890abcdef.html

   # 将文件放到项目中
   cp ~/Downloads/google1234567890abcdef.html public/

   # 提交推送
   git add public/google1234567890abcdef.html
   git commit -m "chore: 添加 Google 验证文件"
   git push origin main
   ```

   **方法 B：HTML 标签验证**
   ```html
   <!-- 在 index.html 的 <head> 中添加 -->
   <meta name="google-site-verification" content="你的验证码" />
   ```

   **方法 C：DNS 验证**
   ```
   在 Spaceship DNS 中添加 TXT 记录：
   主机记录: @
   记录类型: TXT
   记录值: google-site-verification=你的验证码
   ```

4. **点击"验证"按钮**

### 第 2 步：提交 Sitemap

1. 在 Google Search Console 左侧菜单点击"站点地图"
2. 输入：`sitemap.xml`
3. 点击"提交"

### 第 3 步：请求编入索引

1. 在 Google Search Console 顶部搜索框输入：`https://wallpaper.061129.xyz`
2. 点击"请求编入索引"
3. 等待 Google 抓取（通常 1-7 天）

### 第 4 步：监控收录状态

- **覆盖率报告**：查看已收录的页面数量
- **效果报告**：查看搜索展示次数、点击次数
- **网址检查**：测试单个 URL 的收录状态

---

## 🇨🇳 百度搜索引擎收录步骤

### 第 1 步：提交网站到百度搜索资源平台

1. **访问百度搜索资源平台**
   - 网址：https://ziyuan.baidu.com/

2. **注册/登录百度账号**

3. **添加网站**
   - 点击"用户中心" > "站点管理" > "添加网站"
   - 输入：`https://wallpaper.061129.xyz`
   - 选择站点类型：HTTPS
   - 选择站点领域：图片/多媒体

4. **验证网站所有权**（选择一种方法）

   **方法 A：文件验证（推荐）**
   ```bash
   # 百度会提供一个验证文件，下载后放到 public/ 目录
   # 例如：baidu_verify_code-1234567890.html

   cp ~/Downloads/baidu_verify_code-1234567890.html public/

   git add public/baidu_verify_code-1234567890.html
   git commit -m "chore: 添加百度验证文件"
   git push origin main
   ```

   **方法 B：HTML 标签验证**
   ```html
   <!-- 在 index.html 的 <head> 中添加 -->
   <meta name="baidu-site-verification" content="你的验证码" />
   ```

   **方法 C：CNAME 验证**
   ```
   在 Spaceship DNS 中添加 CNAME 记录（按百度提供的要求）
   ```

5. **点击"完成验证"**

### 第 2 步：提交 Sitemap

1. 进入"普通收录" > "sitemap"
2. 输入：`https://wallpaper.061129.xyz/sitemap.xml`
3. 点击"提交"

### 第 3 步：主动推送链接（加快收录）

**手动提交**：
1. 进入"普通收录" > "链接提交"
2. 选择"手动提交"
3. 输入网址列表：
   ```
   https://wallpaper.061129.xyz/
   https://wallpaper.061129.xyz/about
   https://wallpaper.061129.xyz/#/desktop
   https://wallpaper.061129.xyz/#/mobile
   https://wallpaper.061129.xyz/#/avatar
   ```
4. 点击"提交"

**自动推送**（可选，进阶）：
```javascript
// 在 index.html 中添加百度自动推送代码
<script>
(function(){
    var bp = document.createElement('script');
    var curProtocol = window.location.protocol.split(':')[0];
    if (curProtocol === 'https') {
        bp.src = 'https://zz.bdstatic.com/linksubmit/push.js';
    }
    else {
        bp.src = 'http://push.zhanzhang.baidu.com/push.js';
    }
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(bp, s);
})();
</script>
```

### 第 4 步：监控收录状态

- **索引量**：查看已收录的页面数量
- **抓取频次**：查看百度蜘蛛的抓取频率
- **抓取诊断**：测试百度能否正常抓取你的网站

---

## 🚀 加快收录的技巧

### 1. 外部链接建设

**免费方法**：
- 在技术论坛（如掘金、CSDN、思否）发布文章，添加网站链接
- 在 GitHub README 中添加网站链接
- 在社交媒体（微博、知乎）分享网站

**示例**：
```markdown
# 我的壁纸网站

欢迎访问我的高清壁纸网站：https://wallpaper.061129.xyz

提供免费的 4K 壁纸下载，涵盖动漫、风景、人像等多种分类。
```

### 2. 定期更新内容

- 定期添加新壁纸
- 更新 sitemap.xml 的 `<lastmod>` 日期
- 发布新分类或新功能

### 3. 提高网站质量

- **加载速度**：使用 Lighthouse 测试，保持绿色评分
- **移动友好**：确保移动端体验良好
- **内容原创**：避免直接复制其他网站的内容
- **HTTPS**：已启用 ✅
- **无死链**：定期检查链接有效性

### 4. 社交媒体分享

- 微信朋友圈分享（需要 Open Graph 标签，已添加 ✅）
- 微博分享
- QQ 空间分享

### 5. 百度站长工具主动推送

使用百度提供的 API 主动推送新页面（可选）：

```bash
# 使用 curl 推送
curl -H 'Content-Type:text/plain' --data-binary @urls.txt "http://data.zz.baidu.com/urls?site=https://wallpaper.061129.xyz&token=你的token"
```

---

## ⏱️ 收录时间预估

| 搜索引擎 | 首次收录时间 | 完整收录时间 | 备注 |
|---------|------------|------------|------|
| **Google** | 1-3 天 | 1-2 周 | 国际化，收录较快 |
| **百度** | 3-7 天 | 2-4 周 | 对新站有考察期 |
| **Bing** | 2-5 天 | 1-2 周 | 可以同步 Google 数据 |
| **搜狗** | 5-10 天 | 2-3 周 | 参考微信公众号 |

---

## 🔍 验证收录状态

### Google 收录查询

在 Google 搜索框输入：
```
site:wallpaper.061129.xyz
```

如果显示结果，说明已被收录。

### 百度收录查询

在百度搜索框输入：
```
site:wallpaper.061129.xyz
```

### 其他查询方式

**精确 URL 查询**：
```
wallpaper.061129.xyz
```

**关键词排名查询**：
```
高清壁纸 wallpaper.061129.xyz
4K壁纸 wallpaper.061129.xyz
```

---

## 📊 SEO 进阶优化（可选）

### 1. 结构化数据（Schema.org）

```html
<!-- 添加到 index.html 的 <head> -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Wallpaper Gallery",
  "url": "https://wallpaper.061129.xyz",
  "description": "精选高清 4K 壁纸，免费下载",
  "image": "https://wallpaper.061129.xyz/logo.png",
  "author": {
    "@type": "Organization",
    "name": "Wallpaper Gallery"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Wallpaper Gallery"
  }
}
</script>
```

### 2. 添加 breadcrumb（面包屑导航）

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "首页",
      "item": "https://wallpaper.061129.xyz"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "电脑壁纸",
      "item": "https://wallpaper.061129.xyz/#/desktop"
    }
  ]
}
</script>
```

### 3. 图片 SEO 优化

```html
<!-- 为每张图片添加有意义的 alt 文本 -->
<img
  src="wallpaper-001.jpg"
  alt="高清4K动漫壁纸 - 少女与猫咪的温馨场景"
  loading="lazy"
>
```

---

## 📝 操作清单

### 立即完成（今天）

- [x] 添加完整的 SEO meta 标签
- [x] 创建 sitemap.xml
- [x] 创建 robots.txt
- [ ] 注册 Google Search Console
- [ ] 注册百度搜索资源平台
- [ ] 验证网站所有权
- [ ] 提交 sitemap

### 本周完成

- [ ] 请求 Google 编入索引
- [ ] 百度主动推送链接
- [ ] 在技术社区发布网站链接
- [ ] 创建社交媒体分享图片（og-image.jpg）

### 持续优化

- [ ] 每周检查收录状态
- [ ] 定期更新内容
- [ ] 监控 Google Search Console 报告
- [ ] 根据搜索数据优化关键词

---

## 🎯 常见问题

### Q1：多久能被收录？

**A**：Google 通常 1-3 天，百度 3-7 天。如果超过 2 周未收录，检查：
- robots.txt 是否正确
- 网站是否可访问
- 是否有 noindex 标签
- 内容质量是否符合搜索引擎标准

### Q2：为什么 Google 收录了但百度没有？

**A**：百度对新站有"考察期"，通常需要：
- 持续更新内容
- 有一定的外部链接
- 网站运营 1-3 个月

建议：
- 使用百度主动推送
- 在百度贴吧、知道等平台增加曝光

### Q3：收录后排名很低怎么办？

**A**：SEO 是长期工程，建议：
- 优化页面标题和描述
- 提高内容质量和原创性
- 增加外部链接（外链）
- 提升用户体验（加载速度、移动端适配）
- 定期更新内容

### Q4：如何加快收录速度？

**A**：
1. 提交 sitemap.xml
2. 使用百度主动推送
3. 在其他网站添加外链
4. 确保网站质量高
5. 定期更新内容

---

## 🛠️ 相关工具

### SEO 检测工具

- **Google PageSpeed Insights**：https://pagespeed.web.dev/
- **Google Mobile-Friendly Test**：https://search.google.com/test/mobile-friendly
- **百度站长工具**：https://ziyuan.baidu.com/
- **Lighthouse**（Chrome 内置）

### Sitemap 生成工具

- **XML-Sitemaps.com**：https://www.xml-sitemaps.com/
- **Screaming Frog**（桌面工具）

### 关键词研究工具

- **Google Keyword Planner**：https://ads.google.com/home/tools/keyword-planner/
- **百度指数**：https://index.baidu.com/

---

**创建日期**：2025-12-26
**下次更新**：提交搜索引擎后 1 周检查收录状态
