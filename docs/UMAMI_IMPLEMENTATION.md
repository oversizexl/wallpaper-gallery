# Umami Analytics 集成总结

## ✅ 已完成的工作

### 1. Umami 脚本集成

在 `index.html` 中添加了 Umami 统计脚本:

```html
<!-- Umami Analytics (隐私友好的网站统计) -->
<script defer src="https://cloud.umami.is/script.js" data-website-id="886cc266-a7c9-41be-8590-ba2a9371526a"></script>
```

### 2. 创建工具函数库

创建了 `src/utils/analytics.js` 文件,包含以下函数:

- `trackEvent()` - 基础事件追踪函数
- `trackWallpaperDownload()` - 壁纸下载追踪
- `trackWallpaperPreview()` - 壁纸预览追踪
- `trackSearch()` - 搜索追踪
- `trackSeriesSwitch()` - 系列切换追踪
- `trackViewModeChange()` - 视图模式切换追踪
- `trackFilter()` - 筛选追踪(已定义,待使用)
- `trackThemeChange()` - 主题切换追踪(已定义,待使用)
- `trackFullscreenToggle()` - 全屏切换追踪(已定义,待使用)

### 3. 集成到现有组件

#### 壁纸下载和预览追踪

**文件**: `src/components/wallpaper/WallpaperModal.vue`

- 用户打开壁纸详情弹窗时追踪预览事件
- 用户成功下载壁纸后追踪下载事件

#### 搜索追踪

**文件**: `src/components/common/SearchBar.vue`

- 用户确认搜索时追踪搜索关键词和结果数量

#### 系列切换追踪

**文件**: `src/composables/useWallpaperType.js`

- 用户切换壁纸系列时追踪切换行为

#### 视图模式切换追踪

**文件**: `src/composables/useViewMode.js`

- 用户切换视图模式时追踪切换行为

### 4. 创建使用文档

创建了 `docs/UMAMI_GUIDE.md`,包含:

- Umami 介绍和优势
- 已实现的事件追踪列表
- 如何查看统计数据
- 如何添加更多自定义事件
- 最佳实践和常见问题

## 📊 可追踪的用户行为

1. **壁纸下载** - 文件名、分类、大小、分辨率
2. **壁纸预览** - 文件名、分类
3. **搜索** - 搜索关键词、结果数量
4. **系列切换** - 从哪个系列切换到哪个系列
5. **视图模式切换** - 切换到的视图模式(网格/列表/瀑布流)

## 🎯 待添加的事件追踪(可选)

以下函数已在 `analytics.js` 中定义,但尚未集成到组件中:

1. **筛选事件** (`trackFilter`)
   - 在 `FilterPanel.vue` 中添加
   - 追踪用户应用的筛选条件

2. **主题切换** (`trackThemeChange`)
   - 在 `useTheme.js` 中添加
   - 追踪用户切换深色/浅色主题

3. **全屏切换** (`trackFullscreenToggle`)
   - 在 `useFullscreen.js` 中添加
   - 追踪用户进入/退出全屏

## 🔍 如何验证

### 开发环境验证

1. 运行 `npm run dev`
2. 打开浏览器控制台
3. 操作网站(下载壁纸、搜索、切换系列等)
4. 查看控制台是否有 `📊 [Analytics]` 日志

### 生产环境验证

1. 运行 `npm run build` 构建
2. 部署到服务器
3. 访问网站并操作
4. 登录 [https://cloud.umami.is](https://cloud.umami.is)
5. 查看 Events 页面是否有数据

## 📝 注意事项

1. **隐私友好**: Umami 不使用 Cookie,符合 GDPR,无需添加 Cookie 横幅
2. **性能影响**: Umami 脚本仅 2KB,使用 defer 异步加载,不影响页面性能
3. **开发环境**: 开发环境不发送数据到 Umami,只在控制台打印日志
4. **数据限制**: 建议每个事件的数据字段不超过 5 个,保持简洁

## 📚 相关文件

- `index.html` - Umami 脚本引入
- `src/utils/analytics.js` - 事件追踪工具函数
- `docs/UMAMI_GUIDE.md` - 详细使用指南
- `src/components/wallpaper/WallpaperModal.vue` - 下载和预览追踪
- `src/components/common/SearchBar.vue` - 搜索追踪
- `src/composables/useWallpaperType.js` - 系列切换追踪
- `src/composables/useViewMode.js` - 视图模式切换追踪
