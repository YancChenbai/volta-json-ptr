# volta-json-ptr 🚀

**极速 JSON Pointer 解析工具，支持构建时 AOT 优化。**

## 📦 安装

```bash
# 1. 运行时核心（必须）
npm install @volta-json-ptr

# 2. 编译器插件（开发依赖，可选）
npm install -D @volta-json-ptr/compiler
```

---

## 🚀 快速上手

### 1\. 基础用法 (运行时)

直接在项目中使用 `seek` 函数，享有完整的类型推导。

```typescript
import { seek } from '@volta-json-ptr';

const data = { a: { b: [{ c: 1 }] } };
const value = seek(data, '/a/b/0/c'); // 结果: 1
```

### 2\. 自动优化 (构建时)

通过安装 `@volta-json-ptr/compiler`，可以在构建阶段将 `seek` 自动替换为原生 JavaScript 可选链，实现 **0 运行时开销**。

#### **Vite**

```typescript
// vite.config.ts
import jsonPtrCompiler from '@volta-json-ptr/compiler/vite';

export default {
  plugins: [jsonPtrCompiler()],
};
```

#### **Rolldown**

```typescript
// rolldown.config.js
import jsonPtrCompiler from '@volta-json-ptr/compiler/rolldown';

export default {
  plugins: [jsonPtrCompiler()],
};
```

#### **Webpack**

```javascript
// webpack.config.js
const jsonPtrCompiler = require('@volta-json-ptr/compiler/webpack');

module.exports = {
  plugins: [jsonPtrCompiler()],
};
```

---

## ⚡ 转换效果

**编译前 (你的源码):**

```typescript
const val = seek(obj, '/users/0/name');
```

**编译后 (打包产物):**

```javascript
const val = obj?.['users']?.['0']?.['name'];
```

---

## 📄 License

[MIT](https://www.google.com/search?q=./LICENSE)
