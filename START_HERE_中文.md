# 从这里开始：一键检查新版个人主页

这个压缩包已经包含：完整源码、生产构建 `dist/`、本地预览脚本、GitHub Pages 自动部署流程、CV、Blog 和全部本地图片/字体。运行网页时不依赖任何外部 CDN。

## 最快方法：检查已经构建好的网页

### 第 1 步：确认 Node.js

需要 **Node.js 22.12 或更高版本**。

1. 打开 <https://nodejs.org/en/download>。
2. 选择 Node.js 22 LTS 或更高的 LTS 版本。
3. Windows 下载 `.msi`；macOS 下载 `.pkg`。
4. 按默认选项安装。Windows 安装时保留 “Add to PATH”。
5. 安装完成后重新打开终端。

验证：

```bash
node --version
```

应显示 `v22.12.0` 或更高。

### 第 2 步：完整解压

不要直接在压缩软件的预览窗口中运行，也不要只复制 `index.html`。必须完整解压整个文件夹，保留 `_assets`、`assets`、`blog`、`scripts` 等目录结构。

路径建议只使用英文，例如：

```text
D:\Websites\xuanming-homepage
~/Websites/xuanming-homepage
```

### 第 3 步：一键运行

Windows：双击

```text
CHECK_WEBSITE_WINDOWS.bat
```

macOS：右键点击并选择“打开”

```text
CHECK_WEBSITE_MAC_LINUX.command
```

若 macOS 提示没有执行权限，在终端进入解压目录后执行：

```bash
chmod +x CHECK_WEBSITE_MAC_LINUX.command
./CHECK_WEBSITE_MAC_LINUX.command
```

Linux：

```bash
chmod +x CHECK_WEBSITE_MAC_LINUX.command
./CHECK_WEBSITE_MAC_LINUX.command
```

浏览器应自动打开：

```text
http://127.0.0.1:4173/
```

检查期间不要关闭命令窗口。按 `Ctrl+C` 停止服务器。

## 重要：不要双击 dist/index.html

地址栏若显示 `file:///.../dist/index.html`，说明打开方式错误。模块、绝对路径和页面路由在 `file://` 下无法正常工作，页面可能出现无样式或资源缺失。

必须通过上面的一键脚本，或以下命令启动 HTTP 服务：

```bash
npm run preview:dist
```

如果没有 Node.js、但有 Python 3，也可以：

```bash
python3 -m http.server 4173 -d dist
```

Windows 某些环境使用：

```powershell
py -m http.server 4173 -d dist
```

然后访问 <http://127.0.0.1:4173/>。

## 如果仍看到旧版、错位样式或新旧页面混合

旧网站曾注册 cache-first Service Worker，可能继续返回旧 CSS。新版已经完全取消 Service Worker，并带有自动清理逻辑。

依次执行：

1. 打开 `http://127.0.0.1:4173/reset-cache.html`。
2. 点击 “Clear old cache and reload”。
3. 回到主页后按：
   - Windows/Linux Chrome：`Ctrl + Shift + R`
   - macOS Chrome/Safari：`Cmd + Shift + R`
4. 若仍未清除，Chrome 按 `F12`：
   - Application → Service Workers → `Unregister`
   - Application → Storage → `Clear site data`
   - 关闭所有该网站标签页并重新打开。

## 开发模式：修改内容时使用

第一次运行：

```bash
npm install
npm run dev
```

打开 <http://localhost:4321/>。修改源码后浏览器会自动刷新。

正式检查：

```bash
npm run check
npm run build
npm run preview:dist
```

成功标准：

- `astro check` 显示 0 errors、0 warnings。
- `dist/` 被重新生成。
- 首页、MarioLM、Field Notes、MetaMind 两篇长文和 CV 都能打开。

## 常见问题

### `node` 不是内部或外部命令

Node.js 未安装或安装后没有重启终端。重新安装 Node.js LTS，并确保加入 PATH。

### 4173 端口被占用

关闭旧预览窗口，或运行：

Windows PowerShell：

```powershell
$env:PORT=4174; npm run preview:dist
```

macOS/Linux：

```bash
PORT=4174 npm run preview:dist
```

### 页面只有文字、没有样式

通常是直接双击 HTML、没有完整解压、旧 Service Worker，或 `_assets` 目录被遗漏。重新完整解压并通过 HTTP 服务器运行。

### 中文 Blog 图片缺失

确认 `dist/blog/MetaMind/assets/` 中存在 `.webp` 文件。不要单独移动 HTML。

## 下一步

确认视觉与内容后，再按照 [DEPLOYMENT_中文.md](DEPLOYMENT_中文.md) 发布。发布前不需要购买域名，也不需要配置分析服务。
