# 🐾 宠友圈 - Pet Circle

一个专为宠物爱好者打造的社交平台，让每一位铲屎官都能记录宠物成长、分享养宠经验、寻求互助帮助。

## ✨ 功能特性

### 📱 核心功能
- **首页动态流** - 浏览推荐和最新的宠物动态，支持无限滚动加载
- **帖子发布** - 发布图文帖子，添加心情标签和定位信息
- **宠物日记** - 记录宠物的日常生活点滴
- **互助大厅** - 发布求助、分享经验、参与救助讨论
- **私信聊天** - 与其他宠友实时沟通交流
- **宠物管理** - 创建和管理你的宠物档案

### 🔍 社交功能
- **搜索发现** - 搜索宠物、用户、帖子，发现热门话题
- **关注系统** - 关注喜欢的用户和宠物
- **点赞评论** - 互动点赞和评论帖子
- **通知系统** - 接收点赞、评论、关注等通知
- **排行榜** - 查看热心助人榜

### 🎨 用户体验
- **精美UI设计** - 采用暖色调设计风格，温馨友好
- **图片懒加载** - 优化页面加载性能
- **骨架屏** - 提升加载体验
- **响应式布局** - 适配各种屏幕尺寸
- **平滑动画** - 流畅的页面切换和交互效果

## 🛠️ 技术栈

### 前端
- **框架**: Vue 3.5 + TypeScript
- **构建工具**: Vite 6.3
- **状态管理**: Pinia 2.1
- **路由**: Vue Router 4.3
- **UI组件**: Vant 4.8 + Lucide Icons
- **样式**: SCSS
- **存储**: LocalStorage (Pinia Persisted State)

### 后端
- **数据库**: PostgreSQL (Supabase)
- **认证**: Supabase Auth
- **存储**: Supabase Storage
- **实时**: Supabase Realtime

## 📁 项目结构

```
src/
├── components/          # 公共组件
│   ├── TabBar.vue       # 底部导航栏
│   ├── PostCard.vue     # 帖子卡片
│   ├── LoadingSpinner.vue
│   ├── Toast.vue        # 提示组件
│   └── Dialog.vue       # 对话框组件
├── pages/               # 页面组件
│   ├── HomePage.vue     # 首页
│   ├── HelpPage.vue     # 互助大厅
│   ├── DiscoverPage.vue # 发现页
│   ├── ProfilePage.vue  # 个人中心
│   └── ...              # 其他页面
├── stores/              # Pinia状态管理
│   ├── userStore.ts     # 用户状态
│   ├── feedStore.ts     # 动态流状态
│   ├── petStore.ts      # 宠物状态
│   └── ...
├── services/            # API服务层
│   ├── authService.ts   # 认证服务
│   ├── postService.ts   # 帖子服务
│   ├── messageService.ts # 消息服务
│   └── ...
├── utils/               # 工具函数
│   ├── mappers.ts       # 数据映射
│   ├── cache.ts         # 缓存管理
│   ├── errorHandler.ts  # 错误处理
│   ├── supabaseQuery.ts # Supabase查询封装
│   └── logger.ts        # 日志工具
├── composables/         # 组合式函数
│   └── useAsyncAction.ts # 异步操作封装
├── supabase/            # 数据库配置
│   └── init/            # SQL初始化脚本
├── mock/                # Mock数据
└── router/              # 路由配置
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0
- npm >= 9.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 🔧 环境配置

项目使用环境变量配置，创建 `.env` 文件：

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 📊 数据库结构

### 核心表
| 表名 | 说明 |
|------|------|
| users | 用户信息（扩展 auth.users） |
| pets | 宠物档案 |
| posts | 帖子 |
| comments | 评论 |
| likes | 点赞 |
| help_posts | 互助帖子 |
| follows | 关注关系 |
| messages | 私信消息 |
| notifications | 通知 |

## 📱 页面预览

### 首页
![首页预览](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20social%20app%20home%20feed%20mobile%20ui%20warm%20orange%20theme&image_size=portrait_4_3)

### 个人中心
![个人中心](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20social%20app%20profile%20page%20mobile%20ui%20warm%20orange%20theme&image_size=portrait_4_3)

### 互助大厅
![互助大厅](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20community%20help%20forum%20mobile%20ui%20warm%20orange%20theme&image_size=portrait_4_3)

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**🐾 用爱陪伴，用心记录**
