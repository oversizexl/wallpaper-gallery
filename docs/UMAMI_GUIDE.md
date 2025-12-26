# Umami Analytics 使用指南

## 概述

本项目已集成 Umami Analytics,这是一个开源、注重隐私、轻量级的网站统计工具。

**Umami 优势:**

- ✅ 完全免费开源
- ✅ 注重隐私(不使用 Cookie,符合 GDPR)
- ✅ 轻量级(脚本仅 2KB)
- ✅ 国内访问友好
- ✅ 支持自定义事件追踪

## 已实现的事件追踪

### 1. 壁纸下载 (wallpaper_download)

追踪用户下载壁纸的行为

- **触发时机**: 用户点击下载按钮成功下载壁纸后
- **追踪数据**:
  - `filename`: 文件名
  - `category`: 分类
  - `size`: 文件大小
  - `resolution`: 分辨率

### 2. 壁纸预览 (wallpaper_preview)

追踪用户打开壁纸详情弹窗的行为

- **触发时机**: 用户点击壁纸卡片打开详情弹窗时
- **追踪数据**:
  - `filename`: 文件名
  - `category`: 分类

### 3. 搜索 (search)

追踪用户搜索行为

- **触发时机**: 用户按回车键或选择搜索建议时
- **追踪数据**:
  - `query`: 搜索关键词
  - `results`: 搜索结果数量

### 4. 系列切换 (series_switch)

追踪用户切换壁纸系列的行为

- **触发时机**: 用户切换电脑/手机/头像系列时
- **追踪数据**:
  - `from`: 切换前的系列
  - `to`: 切换后的系列

### 5. 视图模式切换 (view_mode_change)

追踪用户切换视图模式的行为

- **触发时机**: 用户切换网格/列表/瀑布流视图时
- **追踪数据**:
  - `mode`: 视图模式(grid/list/masonry)

## 查看统计数据

1. 访问 [https://cloud.umami.is](https://cloud.umami.is)
2. 使用你的账号登录
3. 选择 "Wallpaper Gallery" 网站
4. 在左侧菜单中可以查看:
   - **Dashboard**: 总览数据(访客、页面浏览量、平均访问时长等)
   - **Realtime**: 实时访客
   - **Events**: 自定义事件统计
   - **Pages**: 页面访问统计
   - **Referrers**: 来源统计
   - **Devices**: 设备类型统计

## 如何添加更多自定义事件

### 步骤 1: 在 `src/utils/analytics.js` 中定义新函数

```javascript
/**
 * 追踪筛选事件
 * @param {string} filterType - 筛选类型(category/format/sort)
 * @param {string} filterValue - 筛选值
 */
export function trackFilter(filterType, filterValue) {
  trackEvent('filter_apply', {
    type: filterType,
    value: filterValue,
  })
}
```

### 步骤 2: 在需要的组件中导入并使用

```vue
<script setup>
import { trackFilter } from '@/utils/analytics'

function handleFilterChange(type, value) {
  // 你的业务逻辑
  applyFilter(type, value)

  // 追踪事件
  trackFilter(type, value)
}
</script>
```

## 开发环境调试

在开发环境(`npm run dev`)中,事件不会真正发送到 Umami,而是在控制台打印日志:

```
📊 [Analytics] wallpaper_download { filename: 'image.jpg', category: 'anime', ... }
```

这样可以方便调试,确认事件是否正确触发。

## 生产环境行为

在生产环境(`npm run build`)中,事件会自动发送到 Umami 服务器进行统计。

## 最佳实践

### 1. 事件命名规范

- 使用小写字母和下划线: `wallpaper_download`
- 使用动词+名词形式: `button_click`, `form_submit`
- 保持简洁明了

### 2. 事件数据规范

- 只追踪必要的数据
- 不要追踪用户隐私信息(IP、邮箱等)
- 使用简短的键名
- 值尽量使用字符串或数字

### 3. 追踪时机

- 在操作**成功完成后**追踪,不要在操作前追踪
- 例如下载事件应该在 `downloadFile()` 成功后追踪

### 4. 性能考虑

- Umami 脚本使用 `defer` 属性异步加载,不会阻塞页面
- `trackEvent` 函数有错误处理,不会影响主流程
- 开发环境只打印日志,不发送网络请求

## 常见问题

### Q: 为什么开发环境看不到统计数据?

A: 开发环境的事件不会发送到 Umami,只会在控制台打印日志。只有生产环境构建的代码才会真正追踪。

### Q: 如何验证事件是否正常工作?

A:

1. 开发环境: 查看浏览器控制台是否有 `📊 [Analytics]` 日志
2. 生产环境: 部署后访问网站,操作几次,然后到 Umami 后台 Events 页面查看

### Q: 事件数据有大小限制吗?

A: Umami 对事件数据没有严格限制,但建议保持简洁,每个事件的数据不超过 5 个字段。

### Q: 可以追踪用户身份吗?

A: Umami 不使用 Cookie,不追踪个人身份信息,这也是它注重隐私的原因。如果需要追踪用户行为,应该使用匿名化的标识。

## 相关链接

- [Umami 官方文档](https://umami.is/docs)
- [Umami GitHub](https://github.com/umami-software/umami)
- [Umami Cloud Dashboard](https://cloud.umami.is)
