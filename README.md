# 自在极意锋 · 郑锐锋｜网站源代码

这是一个纯静态网站，无需安装依赖、无需数据库，也不需要登录账号即可浏览。

## 文件说明

- `index.html`：网页主体
- `style.css`：视觉样式与移动端适配
- `app.js`：图片切换、滑动、收藏、分享、放大查看与滚动特效
- `assets/`：专辑封面、背面、长图及图标资源

## 本地预览

直接双击 `index.html` 即可打开。为获得与线上环境一致的效果，也可以在本文件夹中运行任意静态文件服务器。

例如使用 Python：

```bash
python3 -m http.server 8080
```

然后在浏览器访问 `http://localhost:8080`。

## 部署

把本文件夹中的全部文件上传到静态网站服务器根目录即可。支持腾讯云 COS、EdgeOne Pages、GitHub Pages、Netlify、Vercel、Nginx 等静态托管环境。

网站默认首页必须设置为 `index.html`，并保持 `assets` 文件夹名称与目录结构不变。

