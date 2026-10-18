# autoGTM · 华为 PC 营销内容工作台

零运行时依赖的 Node.js 初赛 MVP。输入产品、场景、平台、目标，输出场景判断、知识库依据、图文软文、核验结果。支持真实本地 Markdown 检索与图片、OpenAI 兼容模型，以及按官方契约实现的 ima 搜索/媒体信息适配器。

## 魔搭部署

创空间：https://modelscope.cn/studios/parkourlrc/hw-autoGTM

1. 创建公开创空间，上传项目中已跟踪的源码文件；不要上传 `.env`、`data` 或未审核资料。保留平台 README 中的空间元数据。
2. 部署框架选择 **docker**，资源选择免费 CPU，端口 **7860**，确认部署。Dockerfile 默认监听 `0.0.0.0:7860`；本地 Compose 仍使用 3000。
3. 模型与 ima 凭据通过平台 **Secrets management** 配置；知识库路径通过 `LOCAL_KNOWLEDGE_DIR` 配置，并提供已获公开授权的事实卡与图片。
4. 部署后检查应用页面及 `/api/health`。仅创建空间不代表演示已完成；没有知识库时生成会被缺证门禁阻断。

应用允许魔搭域名通过 iframe 嵌入。当前公开版本仅用于无私密数据的演示；不要配置私人知识库或让访客访问付费模型凭据。运行记录不保证跨平台重启保留。

## 启动

需要 Node.js **22.16+**（推荐 24）。无第三方依赖，无需 npm install。

```powershell
cd D:\桌面\华为赛道\hw-autoGTM
npm start
```

打开 http://127.0.0.1:3000 。默认 `PORT=3000`、`HOST=127.0.0.1`；容器配置 `HOST=0.0.0.0`。容器文件和部署说明见 [初赛验收说明](初赛验收说明.md)。

`.env` 已创建空凭据并被 git 忽略。保留已有配置；首次迁移可从 `.env.example` 复制。配置仅在启动时读取，修改后重启。系统环境变量优先于 `.env`。

| 字段 | 用途 |
| --- | --- |
| `LOCAL_KNOWLEDGE_DIR` | 外部知识库目录，支持绝对或相对工作目录的路径 |
| `MODEL_BASE_URL` | OpenAI 兼容 API 根地址，通常以 `/v1` 结尾；程序追加 `/chat/completions` |
| `MODEL_API_KEY` / `MODEL_NAME` | 模型凭据、实际模型 ID |
| `IMA_BASE_URL` | 默认 `https://ima.qq.com` |
| `IMA_CLIENT_ID` / `IMA_API_KEY` / `IMA_KNOWLEDGE_BASE_ID` | 官方 ima 客户端、凭据及知识库 ID |
| `HOST` / `PORT` | 监听地址与端口 |
| `API_TIMEOUT_MS` | 外部请求超时，默认 20000 毫秒 |
| `DATA_DIR` | 可选运行记录目录，默认项目下 `data`，外置时须自行保护 |

## 本地知识库

不将产品资料、品牌图片或赛题 PDF 放入仓库。`LOCAL_KNOWLEDGE_DIR` 为空时，依次探测仓库外相邻的 `任德耀新建华为PC知识库\华为PC全板块深度知识库_v7` 和 `华为PC全板块深度知识库_v7`。没有可用目录时明确缺证，不编造资料。

自动跳过路径含 `P4`、`机密`、`待审核`、`历史归档` 的目录与文件。精确匹配产品目录名，避免混合 Windows/鸿蒙或不同型号；多张同名事实卡会阻断。文件格式：

```text
<外部知识库>\...\HUAWEI MateBook 14\产品事实.md
<外部知识库>\...\HUAWEI MateBook 14\图片索引.csv
<外部知识库>\...\HUAWEI MateBook 14\images\<实际图片文件>
```

CSV 必需 `文件名`，说明采用 `画面说明` 或 `官网图片说明`，来源采用 `原始图片URL`。查找同目录、`图片`、`images`、`商城款式图片` 中实际存在的 PNG/JPEG/WebP。图片通过已登记 ID 提供，只在当前进程有效，不能传任意文件路径。图片存在不代表发布授权。

## 演示

1. 点击「学习 · 小红书」：HUAWEI MateBook 14，课堂/图书馆场景，3 张实际配图。
2. 点击「办公 · 公众号」：HUAWEI MateBook Pro，移动办公场景，2 张实际配图。
3. 默认「规则模板演示」不访问模型，引用本地事实卡中的操作系统/屏幕原文（保留限定）组成草稿。事实卡可展开全文。
4. 配好模型后显式选择「真实模型」。将发送任务和所匹配事实卡给配置的服务，图片不外发。HTTP/超时/JSON/结构错误会明确失败，绝不静默回落模板。
5. 点击「演示缺证门禁」「演示冲突门禁」展示停止写作。冲突按钮是**人为模拟**，不是全量语义冲突识别。实际缺精确型号、多个同名事实卡也会停止。
6. 复制/下载保留来源与不可正式交付标识；反馈写入本机。认可草稿不等于审核通过。

平台图片约束：小红书 3–6 张、公众号 2–4 张、朋友圈 1–3 张、海报 1 张且最多 3 个段落卖点。数量不足、未知引用或风险词会阻断交付；已有草稿仅供排查和审阅。

## 真实性与实现边界

- 本地资料是用户授权的当前开发数据源，显示「未实时 ima 认证」。真实模型模式才显示 AI 生成；模板不会冒充模型。
- 所有结果 `deliverable=false`。本地规则筛查无法证明完整事实一致、图片授权或正式可发布。产品事实正式取证仍需 ima 与人工复核。
- ima 适配器依据官方包接口参考原创实现：POST `/openapi/wiki/v1/search_knowledge`，JSON `{query,cursor,knowledge_base_id}`；POST `/openapi/wiki/v1/get_media_info`，JSON `{media_id}`。鉴权头为 `ima-openapi-clientid`、`ima-openapi-apikey`。不复制第三方源码。
- 当前 ima 路径可搜索与获取媒体信息；**未实现完整事实卡下载、带授权头图片取回、完整分页取证**。因此选择 ima 会返回证据摘要并阻断正式写作，不能演示成完整集成。
- 实现是检索 → 写作 → 规则核验的单流程，检索源和生成引擎可选择；未实现多智能体调度、在线插件管理、自动全量语义冲突检测或反馈训练。
- 每次成功处理的生成请求记录唯一 ID、时间、版本和节点轨迹，持久化至 `data\runs.jsonl`；反馈至 `data\feedback.jsonl`。这是运行版本记录，不是编辑历史恢复。记录可能包含事实卡原文，仅本地保存且被 git 忽略。
- 赛题允许公开大模型服务不等于允许机密资料外发。模型模式只应连接获授权服务，继续排除机密与未审核资料。
- 本机演示服务未实现登录或多用户隔离，不应直接暴露到公共网络。

## API 契约

`GET /api/health`：`{ok,version}`。

`GET /api/config`：`{version,platforms,demos,localAvailable,modelConfigured,imaConfigured,execution}`。只显示配置完整性，非连通验证；不返回密钥。

`POST /api/generate`：

```json
{
  "product": "HUAWEI MateBook 14",
  "scene": "大学生课堂笔记与图书馆学习",
  "platform": "小红书",
  "goal": "引导了解产品并预约体验",
  "imageCount": 3,
  "source": "local",
  "engine": "template"
}
```

`source` 为 `local|ima`，`engine` 为 `template|model`；可选 `case=missing|conflict` 主动模拟门禁。

200 返回 `{id,version,timestamp,task,scene,knowledge,article,verification,trace}`：`knowledge.evidence[]` 含来源、原文、相对引用；`article` 被门禁阻断时为 null，否则含 `{title,paragraphs,evidenceIds,images,engine,label}`；`verification` 含 `{status:"draft"|"blocked",deliverable:false,checks,limitations}`。门禁不是传输错误。参数/API/模型错误返回 400 `{error}`。

`GET /api/assets/:id`：返回当前进程登记的真实本地图片；未知返回 404。

`POST /api/feedback`：`{runId,action:"accept"|"reject"|"edit",comment}`，comment 最大 2000 字符，200 返回 `{saved:true}`。

## 检查

```powershell
npm run check
npm test
```

Node 内置测试覆盖平台数量、目录排除、精确检索、真实图片、缺证/冲突门禁、模型失败不回落、无效引用、ima 请求契约、HTTP 页面/图片/反馈。模型与 ima 采用 mock，不消耗额度。测试在项目 `test\fixtures-run` 创建合成数据并清理，不复制真实知识库。

主要文件：`src\server.js`（HTTP/流程）、`src\knowledge.js`（本地检索）、`src\ima-adapter.js`（ima 契约）、`public`（中文工作台）、`test\smoke.test.js`。原架构与 UX 文档保留供评审参考。
