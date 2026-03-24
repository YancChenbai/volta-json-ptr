# volta-json-ptr 🚀

**也许是极速 JSON Pointer 解析工具**

## 📦 安装

```bash
npm install volta-json-ptr
```

---

## 🚀 快速上手

### 1\. 基础用法 (运行时)

直接在项目中使用 `seek` 函数，享有完整的类型推导。

```typescript
import { seek } from 'volta-json-ptr';

const data = { a: { b: [{ c: 1 }] } };
const value = seek(data, '/a/b/0/c'); // 结果: 1
```

### 1.1 轻量级访问 (JIT 优化)

如果你需要极快的性能且路径格式固定，使用 `peek` 函数。它通过 JIT 优化显著提升了读取速度。**但请注意，它只会对常见的危险键（如 `__proto__` / `constructor` / `prototype`）进行基本拦截，并不保证对所有未预期的输入都做安全过滤。**

```typescript
import { peek } from 'volta-json-ptr';

const data = { a: { b: [{ c: 1 }] } };
const value = peek(data, '/a/b/0/c'); // 结果: 1
```

### 1.2 不被允许的路径 (安全限制)

为了避免原型链污染和意外行为，`seek` 会拒绝访问以下危险键，并直接返回 `undefined`：

- `__proto__`
- `constructor`
- `prototype`

> 如果你使用 `peek`，请确保你的路径只访问可信数据，因为 `peek` 不会做这类安全校验。

### 2\. 自动优化 (构建时)

通过安装编译器插件，可以在构建阶段将 `seek` 自动替换为原生 JavaScript 可选链，实现 **0 运行时开销**。

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import VoltaJsonPtr from 'volta-json-ptr/vite';

export default defineConfig({
  plugins: [VoltaJsonPtr()],
});
```

<br></details>

<details>
<summary>Rolldown</summary><br>

```typescript
// rolldown.config.js
import VoltaJsonPtr from 'volta-json-ptr/rolldown';

export default {
  plugins: [VoltaJsonPtr()],
};
```

<br></details>

<details>
<summary>Webpack</summary><br>

```javascript
// webpack.config.js
const VoltaJsonPtr = require('volta-json-ptr/webpack');

module.exports = {
  plugins: [VoltaJsonPtr()],
};
```

<br></details>

<details>
<summary>Rollup</summary><br>

```typescript
// rollup.config.js
import VoltaJsonPtr from 'volta-json-ptr/rollup';

export default {
  plugins: [VoltaJsonPtr()],
};
```

<br></details>

<details>
<summary>Rspack</summary><br>

```javascript
// rspack.config.js
const VoltaJsonPtr = require('volta-json-ptr/rspack');

module.exports = {
  plugins: [new VoltaJsonPtr()],
};
```

<br></details>

<details>
<summary>Esbuild</summary><br>

```javascript
// build.js
import VoltaJsonPtr from 'volta-json-ptr/esbuild';

esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  plugins: [VoltaJsonPtr()],
});
```

<br></details>

<details>
<summary>Farm</summary><br>

```javascript
// farm.config.js
import VoltaJsonPtr from 'volta-json-ptr/farm';

export default {
  plugins: [VoltaJsonPtr()],
};
```

<br></details>

<details>
<summary>Bun</summary><br>

```typescript
// build.ts
import voltaJsonPtr from 'volta-json-ptr/bun';

await Bun.build({
  entrypoints: ['./index.ts'],
  outdir: './out',
  plugins: [voltaJsonPtr()],
});
```

<br></details>

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
