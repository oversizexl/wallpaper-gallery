# 🚀 子域名部署快速指南

## 当前方案

使用 `wallpaper.061129.xyz` 子域名部署，无需创建 `username.github.io` 仓库。

---

## ✅ 已完成

- ✅ CNAME 文件已创建：`wallpaper.061129.xyz`
- ✅ 根域名 DNS A 记录已配置（4 条 GitHub IP）
- ✅ 代码已提交到本地仓库

---

## 📋 3 步完成部署

### 第 1 步：添加子域名 CNAME 记录

访问 Spaceship DNS 管理：https://www.spaceship.com/

1. 登录账号
2. **Domains** > 选择 `061129.xyz` > **DNS Records**
3. 点击 **Add Record**，填入：
   ```
   Type: CNAME
   Name: wallpaper
   Value: it-nuanxinpro.github.io.  ← 注意末尾有点
   TTL: 3600
   ```
4. 点击 **Save**

---

### 第 2 步：推送代码到 GitHub

```bash
git push origin main
```

---

### 第 3 步：配置 GitHub Pages

访问：https://github.com/IT-NuanxinPro/wallpaper-gallery/settings/pages

配置：
1. **Source**: Deploy from a branch
2. **Branch**: main, / (root)
3. **Custom domain**: `wallpaper.061129.xyz`
4. **Enforce HTTPS**: ✓ 勾选

---

## 🔍 验证部署

### 运行验证脚本

```bash
./check-subdomain-dns.sh
```

### 手动验证

1. **检查 DNS**（添加记录后 5-30 分钟）：
   ```bash
   dig wallpaper.061129.xyz CNAME +short
   # 应返回: it-nuanxinpro.github.io.
   ```

2. **访问网站**：
   - https://wallpaper.061129.xyz

3. **检查部署状态**：
   - https://github.com/IT-NuanxinPro/wallpaper-gallery/actions

---

## 📚 详细文档

| 文档 | 用途 |
|------|------|
| `SUBDOMAIN_GUIDE.md` | 完整的多子域名部署指南（包含团队协作） |
| `check-subdomain-dns.sh` | DNS 配置验证脚本 |

---

## 🎯 关键要点

1. **子域名方案优势**：
   - ✅ 无需创建 `username.github.io` 仓库
   - ✅ 支持多个项目使用不同子域名
   - ✅ 团队成员可独立管理各自的子域名

2. **DNS 配置要点**：
   - 根域名用 **A 记录**（指向 GitHub IP）
   - 子域名用 **CNAME 记录**（指向 `username.github.io.`）
   - CNAME 值末尾必须有点 `.`

3. **HTTPS 自动配置**：
   - GitHub 使用 Let's Encrypt 自动签发证书
   - DNS 验证通过后约 5-10 分钟生效
   - 证书 90 天自动续期

---

## 🆘 常见问题

**Q: DNS 验证一直失败？**
A: 检查 CNAME 记录末尾是否有点 `.`，等待 5-30 分钟让 DNS 传播

**Q: 404 错误？**
A: 检查 CNAME 文件是否已推送，GitHub Pages 设置是否正确

**Q: HTTPS 无法启用？**
A: 等待 DNS 验证完成（绿色 ✓），通常需要 5-10 分钟

---

## 🌐 访问地址

- **自定义域名**: https://wallpaper.061129.xyz（推荐）
- **GitHub 默认**: https://it-nuanxinpro.github.io/wallpaper-gallery（备用）

---

**预计配置时间**: 10-15 分钟（含 DNS 传播）
**最后更新**: 2025-12-26
