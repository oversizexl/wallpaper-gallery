# 🌐 多项目子域名部署指南

## 架构概览

使用同一个主域名 `061129.xyz`，为多个项目提供独立子域名访问：

```
061129.xyz (根域名)
├── wallpaper.061129.xyz → IT-NuanxinPro/wallpaper-gallery (你的壁纸站)
├── blog.061129.xyz      → colleague/blog-repo (同事的博客)
└── tools.061129.xyz     → another/tools-project (其他工具)
```

**核心优势**：
- ✅ 每个项目独立仓库、独立部署、独立更新
- ✅ 自动 HTTPS 证书（Let's Encrypt）
- ✅ 不需要创建 `username.github.io` 仓库
- ✅ 普通项目仓库即可使用 GitHub Pages
- ✅ 团队成员各自管理自己的项目

---

## 📋 第一步：DNS 配置（Spaceship 后台）

### 根域名 A 记录（已配置 ✅）

| 主机记录 | 类型 | 记录值 | TTL |
|---------|------|--------|-----|
| @ | A | 185.199.108.153 | 1800 |
| @ | A | 185.199.109.153 | 1800 |
| @ | A | 185.199.110.153 | 1800 |
| @ | A | 185.199.111.153 | 1800 |

### 子域名 CNAME 记录（需要添加）

| 主机记录 | 类型 | 记录值 | TTL | 说明 |
|---------|------|--------|-----|------|
| wallpaper | CNAME | it-nuanxinpro.github.io. | 3600 | 你的壁纸站 |
| blog | CNAME | colleague.github.io. | 3600 | 同事的博客（示例） |
| tools | CNAME | another.github.io. | 3600 | 其他工具（示例） |

⚠️ **关键细节**：
1. **末尾的点 `.` 必须保留**！（表示绝对域名，FQDN）
2. 子域名用 **CNAME**，根域名用 **A**
3. CNAME 值指向对应用户的 `username.github.io`

---

## 🔧 第二步：Spaceship DNS 配置操作

### 登录 Spaceship 后台

1. 访问：https://www.spaceship.com/
2. 登录账号
3. 进入 **Domains** > 选择 `061129.xyz` > **DNS Records**

### 添加壁纸站子域名

点击 **Add Record**，填入：

```
Type: CNAME
Name: wallpaper
Value: it-nuanxinpro.github.io.  ← 注意末尾有点
TTL: 3600 (或 Auto)
```

点击 **Save**

### 验证 DNS 配置

在终端运行：

```bash
dig wallpaper.061129.xyz CNAME +short
```

应返回：`it-nuanxinpro.github.io.`

---

## ⚙️ 第三步：GitHub Pages 配置（wallpaper-gallery 仓库）

### 操作步骤

1. **访问仓库设置页面**：
   https://github.com/IT-NuanxinPro/wallpaper-gallery/settings/pages

2. **配置 Build and deployment**：
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` 分支
   - **Folder**: `/ (root)`
   - 点击 **Save**

3. **配置自定义域名**：
   - 在 **Custom domain** 输入框填入：`wallpaper.061129.xyz`
   - 点击 **Save**
   - 等待 DNS 检查完成（显示绿色 ✓）

4. **启用 HTTPS**：
   - 勾选 **Enforce HTTPS**
   - GitHub 会自动签发 SSL 证书（Let's Encrypt）

---

## 🚀 第四步：推送 CNAME 文件

CNAME 文件已创建并提交到仓库根目录，内容为：

```
wallpaper.061129.xyz
```

推送到 GitHub：

```bash
git push origin main
```

---

## ✅ 第五步：验证部署

### 等待部署完成（约 1-5 分钟）

1. **查看 GitHub Actions**：
   https://github.com/IT-NuanxinPro/wallpaper-gallery/actions
   - 等待显示绿色 ✓（部署成功）

2. **测试访问**：
   - GitHub 默认地址：https://it-nuanxinpro.github.io/wallpaper-gallery
   - 自定义子域名：https://wallpaper.061129.xyz（DNS 生效后）

3. **验证 HTTPS**：
   - 浏览器地址栏显示 🔒 锁图标
   - 证书由 Let's Encrypt 自动签发

---

## 👥 第六步：团队成员操作指南

### 同事如何添加自己的子域名站点？

#### 1. 同事在 Spaceship 添加子域名（如果你是域名管理员）

或者你帮同事添加：

```
Type: CNAME
Name: blog
Value: colleague.github.io.  ← 同事的 GitHub 用户名
TTL: 3600
```

#### 2. 同事在自己的仓库中配置

1. 在仓库根目录创建 `CNAME` 文件，内容为：
   ```
   blog.061129.xyz
   ```

2. 访问仓库设置：
   `https://github.com/colleague/blog-repo/settings/pages`

3. 配置：
   - Source: Deploy from a branch
   - Branch: main, / (root)
   - Custom domain: `blog.061129.xyz`
   - Enforce HTTPS: ✓

4. 推送代码：
   ```bash
   git add CNAME
   git commit -m "chore: 添加自定义域名 blog.061129.xyz"
   git push origin main
   ```

---

## 🔍 工作原理

### 为什么这样能工作？

1. **DNS 解析流程**：
   ```
   用户访问 wallpaper.061129.xyz
   ↓
   DNS CNAME 解析到 it-nuanxinpro.github.io
   ↓
   GitHub 服务器收到请求，读取 HTTP Header: Host: wallpaper.061129.xyz
   ↓
   GitHub 查找哪个仓库配置了这个自定义域名
   ↓
   返回 IT-NuanxinPro/wallpaper-gallery 的内容
   ```

2. **HTTPS 证书自动签发**：
   - GitHub 使用 Let's Encrypt 自动为每个自定义域名签发证书
   - 90 天自动续期，无需手动操作
   - 支持 HTTP/2 和 HSTS

3. **多项目隔离**：
   - 每个子域名独立解析到不同的 GitHub 仓库
   - 互不影响，独立部署
   - 可以来自不同 GitHub 账号

---

## 🛠️ 验证工具脚本

### 检查子域名 DNS 配置

创建 `check-subdomain-dns.sh`：

```bash
#!/bin/bash

SUBDOMAIN="wallpaper.061129.xyz"
EXPECTED_CNAME="it-nuanxinpro.github.io."

echo "🔍 检查子域名: $SUBDOMAIN"
echo ""

# 检查 CNAME 记录
CNAME_RESULT=$(dig +short "$SUBDOMAIN" CNAME)

if [ -z "$CNAME_RESULT" ]; then
    echo "❌ 错误: 未找到 CNAME 记录"
    echo "   请在 Spaceship 添加 CNAME 记录"
    exit 1
fi

echo "✅ CNAME 记录: $CNAME_RESULT"

if [ "$CNAME_RESULT" = "$EXPECTED_CNAME" ]; then
    echo "✅ 配置正确！"
else
    echo "⚠️  预期: $EXPECTED_CNAME"
    echo "   实际: $CNAME_RESULT"
fi

# 检查最终 IP
echo ""
echo "🌐 最终解析 IP:"
dig +short "$SUBDOMAIN" A

# 测试 HTTPS
echo ""
echo "🔐 测试 HTTPS 访问..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$SUBDOMAIN" --max-time 5 || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ HTTPS 访问成功 (HTTP $HTTP_STATUS)"
else
    echo "⏳ HTTP 状态码: $HTTP_STATUS (可能需要等待 DNS 传播)"
fi
```

运行：

```bash
chmod +x check-subdomain-dns.sh
./check-subdomain-dns.sh
```

---

## 🆘 常见问题排查

### 问题 1：DNS 检查失败

**症状**：GitHub Pages 显示 "DNS check is still in progress"

**解决方案**：
1. 检查 CNAME 记录末尾是否有 `.`（必须有）
2. 等待 DNS 传播（5-30 分钟）
3. 使用 `dig wallpaper.061129.xyz CNAME +short` 验证
4. 清除 GitHub Pages 自定义域名，等待 1 分钟后重新填入

### 问题 2：HTTPS 无法启用

**症状**：Enforce HTTPS 不可用

**解决方案**：
1. 确保 DNS 验证已完成（绿色 ✓）
2. 等待 5-10 分钟让 GitHub 签发证书
3. 检查 CNAME 文件内容是否与 Custom domain 一致

### 问题 3：404 错误

**症状**：访问子域名显示 404

**解决方案**：
1. 检查 GitHub Actions 部署状态
2. 确认 CNAME 文件已推送到仓库
3. 确认 GitHub Pages 设置中的 Custom domain 正确
4. 等待几分钟让部署完成

### 问题 4：根域名怎么办？

**选项 A：保持空白**（推荐）
- 根域名 `061129.xyz` 不设内容
- 所有服务都通过子域名访问

**选项 B：301 重定向到主站**
- 创建 `IT-NuanxinPro.github.io` 仓库
- 绑定 `061129.xyz`
- 使用 HTML meta 重定向或 JavaScript 跳转到 `wallpaper.061129.xyz`

**选项 C：独立主页**
- 创建一个导航页，列出所有子站点链接

---

## 📊 多项目架构示例

### 实际部署示例

| 子域名 | GitHub 仓库 | 维护者 | 用途 |
|--------|------------|--------|------|
| wallpaper.061129.xyz | IT-NuanxinPro/wallpaper-gallery | 你 | 壁纸画廊 |
| blog.061129.xyz | colleague/tech-blog | 同事 A | 技术博客 |
| tools.061129.xyz | teammate/dev-tools | 同事 B | 开发工具集 |
| api.061129.xyz | IT-NuanxinPro/api-docs | 你 | API 文档 |
| demo.061129.xyz | another/demo-site | 其他人 | 演示站点 |

### DNS 配置清单

```dns
# Spaceship DNS Records

# 根域名 A 记录（必需）
@           A       185.199.108.153     1800
@           A       185.199.109.153     1800
@           A       185.199.110.153     1800
@           A       185.199.111.153     1800

# 子域名 CNAME 记录
wallpaper   CNAME   it-nuanxinpro.github.io.    3600
blog        CNAME   colleague.github.io.        3600
tools       CNAME   teammate.github.io.         3600
api         CNAME   it-nuanxinpro.github.io.    3600
demo        CNAME   another.github.io.          3600
```

---

## 🎯 最佳实践

### 1. 命名规范

- ✅ 使用有意义的子域名：`wallpaper`, `blog`, `api`
- ❌ 避免过长或难记的名称：`my-awesome-wallpaper-collection`

### 2. CNAME 文件管理

- ✅ 将 CNAME 文件纳入版本控制
- ✅ 在 `.gitignore` 中不要忽略 CNAME
- ✅ 每次修改域名时更新 CNAME 文件

### 3. HTTPS 强制启用

- ✅ 始终勾选 "Enforce HTTPS"
- ✅ 不要使用 `http://`，始终用 `https://`

### 4. DNS TTL 设置

- 🕐 生产环境：TTL 设为 3600-7200（1-2 小时）
- 🕐 测试阶段：TTL 设为 300-600（5-10 分钟）

---

## 📚 相关资源

- **GitHub Pages 官方文档**：https://docs.github.com/en/pages
- **自定义域名配置**：https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
- **DNS 传播检查**：https://www.whatsmydns.net/
- **HTTPS 证书详情**：https://letsencrypt.org/

---

## ✅ 快速操作清单

### 你需要做的（一次性配置）

- [ ] 在 Spaceship 添加子域名 CNAME 记录：`wallpaper` → `it-nuanxinpro.github.io.`
- [ ] 在 GitHub Pages 设置自定义域名：`wallpaper.061129.xyz`
- [ ] 勾选 Enforce HTTPS
- [ ] 推送 CNAME 文件到仓库
- [ ] 等待 DNS 传播和部署完成（5-30 分钟）
- [ ] 访问 https://wallpaper.061129.xyz 验证

### 团队成员需要做的（每个项目独立）

- [ ] 让你在 Spaceship 添加他们的子域名 CNAME 记录
- [ ] 在自己的仓库根目录创建 CNAME 文件
- [ ] 在 GitHub Pages 设置中配置自定义域名
- [ ] 推送代码并等待部署

---

**最后更新**：2025-12-26
**架构类型**：多子域名 + 多仓库 GitHub Pages
**预计配置时间**：10-15 分钟（每个子域名）
