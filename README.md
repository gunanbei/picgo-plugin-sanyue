# PicGo Plugin - SanYue ImgBed

一个用于 PicGo 的 SanYue 图床上传插件，支持多种上传渠道。

## 功能特性

- 🚀 支持多种上传渠道（Telegram、CF-R2、S3）
- 🔐 基于 Token 的身份验证
- 📱 简单易用的配置界面
- 🎯 自动处理图片上传和URL生成

## 安装

### 方法一：通过 PicGo 插件市场安装

1. 打开 PicGo 应用
2. 进入 `插件设置`
3. 搜索 `picgo-plugin-sanyue-imgbed`
4. 点击安装

### 方法二：手动安装

```bash
npm install picgo-plugin-sanyue-imgbed
```

## 配置说明

### 1. 获取 SanYue 图床配置

在使用本插件之前，您需要：

1. 注册 SanYue 图床账号
2. 获取 API 地址和 Token
3. 选择合适的上传渠道

### 2. 插件配置

在 PicGo 的插件设置中找到 `ImgBed Sanyue` 插件，点击配置：

#### 必需配置项

| 配置项 | 说明 | 示例 |
|--------|------|------|
| **API地址** | SanYue 图床的 API 地址（不包含 /upload） | `https://api.sanyue.com` |
| **Token** | 拥有上传权限的认证 Token | `your_token_here` |

#### 可选配置项

| 配置项 | 说明 | 默认值 | 选项 |
|--------|------|--------|------|
| **上传渠道** | 选择图片存储的渠道 | `telegram` | TG、CF-R2、S3 |

### 3. 上传渠道说明

#### Telegram (TG)
- **特点**: 免费、稳定、速度快
- **适用**: 个人博客、文档站点

#### CF-R2
- **特点**: 基于 Cloudflare R2 存储
- **适用**: 需要 CDN 加速的场景
- **优势**: 全球访问速度快

#### S3
- **特点**: 兼容 Amazon S3 协议
- **适用**: 企业级应用
- **优势**: 高可用性和可扩展性

## 使用说明

### 1. 基本使用

1. 完成上述配置后，在 PicGo 主界面选择 `ImgBed Sanyue` 作为默认图床
2. 拖拽图片到 PicGo 或使用快捷键上传
3. 上传成功后会自动复制图片链接到剪贴板

### 2. 批量上传

1. 选择多张图片
2. 拖拽到 PicGo 界面
3. 等待所有图片上传完成
4. 所有链接会自动复制到剪贴板

### 3. 快捷键上传

- **Windows/Linux**: `Ctrl + Shift + P`
- **macOS**: `Cmd + Shift + P`

## 故障排除

### 常见问题

#### 1. 上传失败
- **检查网络连接**: 确保网络正常
- **验证 Token**: 确认 Token 有效且有上传权限
- **检查 API 地址**: 确保地址正确且可访问

#### 2. 返回解析失败
- **检查 JsonPath 设置**: 默认为 `src`
- **联系管理员**: 如果问题持续存在

#### 3. 图片无法显示
- **检查图片链接**: 确认返回的 URL 格式正确
- **验证上传渠道**: 确认选择的渠道可用

### 错误代码说明

| 错误信息 | 可能原因 | 解决方案 |
|----------|----------|----------|
| `Can't find uploader config` | 配置未完成 | 检查并完成所有必需配置 |
| `上传失败` | 网络或服务器问题 | 检查网络连接和服务器状态 |
| `返回解析失败` | API 返回格式变化 | 联系插件开发者 |

## 开发信息

- **版本**: 1.1.1
- **作者**: huajianling
- **许可证**: MIT
- **GitHub**: [https://github.com/gunanbei/picgo-plugin-sanyue](https://github.com/gunanbei/picgo-plugin-sanyue)

## 更新日志

### v1.1.1
- 修复上传渠道选择问题
- 优化错误处理机制
- 改进配置界面

### v1.0.0
- 初始版本发布
- 支持基本图片上传功能
- 支持多种上传渠道

## 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个插件！

## 许可证

MIT License - 详见 [LICENSE](License) 文件
