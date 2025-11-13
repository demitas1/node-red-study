# Node-RED Custom Node Development with TypeScript

TypeScriptを使用したNode-REDカスタムノード開発手順をまとめます。

## 目次

- [概要](#概要)
- [TypeScriptを使用する理由](#typescriptを使用する理由)
- [ディレクトリ構成](#ディレクトリ構成)
- [環境構築](#環境構築)
- [TypeScriptでのノード実装](#typescriptでのノード実装)
- [開発ワークフロー](#開発ワークフロー)
- [トラブルシューティング](#トラブルシューティング)

## 概要

このプロジェクトでは、Node-REDカスタムノードをTypeScriptで開発しています。TypeScriptをJavaScriptにトランスパイルし、Node-REDで実行します。

**重要な制限事項**: Node-REDではカスタムノードで複数の物理的な入力ポートはサポートされていません。`inputs`プロパティの有効な値は`0`または`1`のみです。複数のデータソースを扱う場合は、`msg.topic`などで入力を区別します。

## TypeScriptを使用する理由

### メリット

1. **型安全性**: コンパイル時に型エラーを検出
2. **IDE補完**: より良い開発体験（VSCode等）
3. **リファクタリング**: 安全なコード変更
4. **保守性**: 大規模なノード開発に有利
5. **ドキュメント**: 型定義自体がドキュメントになる

### デメリット

1. **ビルドステップの追加**: 開発フローが若干複雑化
2. **学習コスト**: TypeScript自体の学習が必要

## ディレクトリ構成

```
node-red-study/
├── docker/
│   ├── docker-compose.yml          # カスタムノードをマウント設定済み
│   ├── data/                       # Node-REDデータ
│   └── ...
├── custom-nodes/                   # ★カスタムノード開発用
│   └── node-red-contrib-my-nodes/
│       ├── package.json            # TypeScript設定を含む
│       ├── tsconfig.json           # TypeScriptコンパイル設定
│       ├── .gitignore             # dist/などを除外
│       ├── src/                    # ★TypeScriptソース
│       │   └── nodes/
│       │       ├── data-filter.ts
│       │       ├── data-filter.html
│       │       ├── timestamp-merge.ts
│       │       └── timestamp-merge.html
│       ├── dist/                   # ★ビルド成果物（Git除外）
│       │   └── nodes/
│       │       ├── data-filter.js
│       │       ├── data-filter.html
│       │       ├── timestamp-merge.js
│       │       └── timestamp-merge.html
│       └── icons/
├── scripts/
│   ├── build-custom-nodes.sh      # ★TypeScriptビルド用
│   ├── install-custom-nodes.sh    # ★ビルド+インストール
│   └── reload-custom-nodes.sh     # ★ビルド+再起動
└── docs/
```

## 環境構築

### 1. プロジェクト初期化

```bash
# カスタムノードディレクトリを作成
mkdir -p custom-nodes/node-red-contrib-my-nodes
cd custom-nodes/node-red-contrib-my-nodes
```

### 2. package.json を作成

```json
{
  "name": "node-red-contrib-my-nodes",
  "version": "0.1.0",
  "description": "Custom nodes for Node-RED",
  "keywords": [
    "node-red",
    "custom"
  ],
  "author": "DEMI",
  "license": "Apache-2.0",
  "scripts": {
    "build": "npm run clean && npm run compile && npm run copy-html",
    "clean": "rm -rf dist",
    "compile": "tsc",
    "copy-html": "cp src/nodes/*.html dist/nodes/",
    "watch": "tsc --watch",
    "prepublishOnly": "npm run build"
  },
  "node-red": {
    "nodes": {
      "timestamp-merge": "dist/nodes/timestamp-merge.js",
      "data-filter": "dist/nodes/data-filter.js"
    }
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/node-red": "^1.3.0",
    "@types/node-red-node-test-helper": "^0.3.0",
    "typescript": "^5.3.0"
  }
}
```

**重要ポイント**:
- `scripts`: ビルドコマンドを定義
- `node-red.nodes`: **`dist/`参照**に注意（TypeScriptコンパイル後のパス）
- `devDependencies`: TypeScript関連パッケージ

### 3. tsconfig.json を作成

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "types": ["node"],
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": false,
    "noImplicitThis": true,
    "alwaysStrict": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**重要ポイント**:
- `outDir`: ビルド成果物は`dist/`
- `rootDir`: ソースは`src/`
- `strict`: 厳格な型チェックを有効化
- `sourceMap`: デバッグ用ソースマップを生成

### 4. .gitignore を作成

```gitignore
# TypeScript build output
dist/
*.js.map

# Dependencies
node_modules/

# npm
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db
```

### 5. ディレクトリ構造を作成

```bash
mkdir -p src/nodes
mkdir -p dist/nodes
mkdir -p icons
```

### 6. TypeScript依存関係をインストール

```bash
npm install
```

## TypeScriptでのノード実装

### 基本的な型定義

Node-REDカスタムノードのTypeScript実装で使用する主要な型：

```typescript
import { Node, NodeDef, NodeAPI, NodeMessageInFlow } from 'node-red';

// ノード設定の型
interface MyNodeConfig extends NodeDef {
  threshold: number;  // 設定項目
}

// ノードインスタンスの型
interface MyNode extends Node {
  threshold: number;  // インスタンスプロパティ
}
```

### 例1: data-filter.ts

`src/nodes/data-filter.ts`:

```typescript
import { Node, NodeDef, NodeAPI, NodeMessageInFlow } from 'node-red';

interface DataFilterNodeConfig extends NodeDef {
  threshold: number;
}

interface DataFilterNode extends Node {
  threshold: number;
}

module.exports = function(RED: NodeAPI) {
  function DataFilterNode(this: DataFilterNode, config: DataFilterNodeConfig) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.threshold = config.threshold || 0;

    node.on('input', function(msg: NodeMessageInFlow, send: (msg: NodeMessageInFlow | NodeMessageInFlow[]) => void, done: (err?: Error) => void) {
      send = send || function() { node.send.apply(node, arguments as any); };
      done = done || function(err?: Error) { if (err) node.error(err, msg); };

      if (typeof msg.payload === 'number') {
        if (msg.payload > node.threshold) {
          send(msg);
          node.status({fill:"green", shape:"dot", text:`passed: ${msg.payload}`});
        } else {
          node.status({fill:"red", shape:"dot", text:`filtered: ${msg.payload}`});
        }
      } else {
        node.warn("Payload is not a number");
      }

      done();
    });
  }

  RED.nodes.registerType("data-filter", DataFilterNode as any);
};
```

`src/nodes/data-filter.html`:

```html
<script type="text/javascript">
    RED.nodes.registerType('data-filter', {
        category: 'custom',
        color: '#e9967a',
        defaults: {
            name: {value: ""},
            threshold: {value: 0, required: true, validate: RED.validators.number()}
        },
        inputs: 1,
        outputs: 1,
        icon: "font-awesome/fa-filter",
        label: function() {
            return this.name || "data filter";
        }
    });
</script>

<script type="text/html" data-template-name="data-filter">
    <div class="form-row">
        <label for="node-input-name"><i class="fa fa-tag"></i> Name</label>
        <input type="text" id="node-input-name" placeholder="Name">
    </div>
    <div class="form-row">
        <label for="node-input-threshold"><i class="fa fa-filter"></i> Threshold</label>
        <input type="number" id="node-input-threshold" placeholder="0">
    </div>
</script>

<script type="text/html" data-help-name="data-filter">
    <p>Filters values above a threshold</p>
    <h3>Configuration</h3>
    <dl class="message-properties">
        <dt>Threshold</dt>
        <dd>Only values greater than this threshold will pass through</dd>
    </dl>
    <h3>Input</h3>
    <dl class="message-properties">
        <dt>payload <span class="property-type">number</span></dt>
        <dd>Numeric value to filter</dd>
    </dl>
    <h3>Output</h3>
    <dl class="message-properties">
        <dt>payload <span class="property-type">number</span></dt>
        <dd>Only sent if value is greater than threshold</dd>
    </dl>
</script>
```

### 例2: timestamp-merge.ts

`src/nodes/timestamp-merge.ts`:

```typescript
import { Node, NodeDef, NodeAPI, NodeMessageInFlow } from 'node-red';

interface TimestampMergeNodeConfig extends NodeDef {
}

interface TimestampMergeNode extends Node {
  latestTimestamp: any;
}

interface OutputMessage {
  payload: {
    timestamp: any;
    text: any;
  };
}

module.exports = function(RED: NodeAPI) {
  function TimestampMergeNode(this: TimestampMergeNode, config: TimestampMergeNodeConfig) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.latestTimestamp = null;

    node.on('input', function(msg: NodeMessageInFlow, send: (msg: NodeMessageInFlow | NodeMessageInFlow[]) => void, done: (err?: Error) => void) {
      send = send || function() { node.send.apply(node, arguments as any); };
      done = done || function(err?: Error) { if (err) node.error(err, msg); };

      if (msg.topic === 'timestamp' || (msg as any)._port === 0) {
        node.latestTimestamp = msg.payload;
        node.status({fill:"green", shape:"dot", text:"timestamp updated"});
        done();
      }
      else if (msg.topic === 'string' || (msg as any)._port === 1) {
        if (node.latestTimestamp !== null) {
          const outputMsg: OutputMessage = {
            payload: {
              timestamp: node.latestTimestamp,
              text: msg.payload
            }
          };
          send(outputMsg as any);
          node.status({fill:"blue", shape:"dot", text:"sent"});
        } else {
          node.warn("No timestamp available");
        }
        done();
      }
    });
  }

  RED.nodes.registerType("timestamp-merge", TimestampMergeNode as any);
};
```

**TypeScript実装のポイント**:

1. **型のインポート**: `NodeAPI`, `Node`, `NodeDef`, `NodeMessageInFlow`
2. **型アサーション**: `as any`は必要な場合のみ使用（Node-RED APIの制約）
3. **インターフェース定義**: Config、Node、OutputMessageなど
4. **厳格な型チェック**: `strict: true`で型安全性を確保

### HTMLファイルについて

HTMLファイルはTypeScriptの対象外です。`src/nodes/`に配置し、ビルド時に`dist/nodes/`にコピーされます。

## 開発ワークフロー

### 初回インストール

```bash
# 1. TypeScriptノードを実装（src/nodes/*.ts, *.html）

# 2. package.jsonを更新（新しいノードを追加した場合）

# 3. インストールスクリプトを実行
./scripts/install-custom-nodes.sh
```

このスクリプトは以下を自動実行：
1. TypeScriptビルド（`npm run build`）
2. Node-REDコンテナ内でnpm install
3. Node-RED再起動

### ノードの修正

```bash
# 1. TypeScriptファイルを編集
vim custom-nodes/node-red-contrib-my-nodes/src/nodes/data-filter.ts

# 2. リロードスクリプトを実行
./scripts/reload-custom-nodes.sh

# 3. ブラウザをリフレッシュ（Ctrl+R / Cmd+R）
```

このスクリプトは以下を自動実行：
1. TypeScriptビルド
2. Node-RED再起動

### ビルドのみ実行

```bash
# TypeScriptをJavaScriptにコンパイル（Node-RED再起動なし）
./scripts/build-custom-nodes.sh
```

### watchモードでの開発

```bash
# 別ターミナルでwatchモードを起動
cd custom-nodes/node-red-contrib-my-nodes
npm run watch

# ファイル保存時に自動ビルド
# Node-REDの再起動は手動で実行
./scripts/reload-custom-nodes.sh
```

### 新しいノードの追加

```bash
# 1. TypeScriptとHTMLファイルを作成
touch src/nodes/new-node.ts
touch src/nodes/new-node.html

# 2. TypeScriptファイルを実装
vim src/nodes/new-node.ts

# 3. package.jsonを更新
vim package.json
# "node-red": {
#   "nodes": {
#     "new-node": "dist/nodes/new-node.js"  ← 追加
#   }
# }

# 4. インストールスクリプトを実行
./scripts/install-custom-nodes.sh
```

## トラブルシューティング

### ビルドエラー: 型が見つからない

```bash
# TypeScript型定義が不足している場合
npm install --save-dev @types/node-red

# node_modulesを再インストール
rm -rf node_modules package-lock.json
npm install
```

### コンパイルエラー: Module '"node-red"' has no exported member 'Red'

正しい型名は`NodeAPI`です：

```typescript
// ❌ 間違い
import { Red } from 'node-red';
module.exports = function(RED: Red) { ... }

// ✅ 正しい
import { NodeAPI } from 'node-red';
module.exports = function(RED: NodeAPI) { ... }
```

### ノードが表示されない

```bash
# 1. ビルドが成功しているか確認
cd custom-nodes/node-red-contrib-my-nodes
npm run build

# 2. dist/にファイルが生成されているか確認
ls -la dist/nodes/

# 3. Node-REDログを確認
docker compose logs nodered --tail 50

# 4. コンテナ内のファイルを確認
docker exec nodered ls -la /data/node_modules/node-red-contrib-my-nodes/dist/nodes/
```

### package.jsonのパスが間違っている

`node-red.nodes`セクションは**`dist/`参照**である必要があります：

```json
{
  "node-red": {
    "nodes": {
      "my-node": "dist/nodes/my-node.js"  // ✅ 正しい（dist/）
      // "my-node": "nodes/my-node.js"    // ❌ 間違い（JavaScript時代の設定）
    }
  }
}
```

### HTMLファイルがコピーされない

```bash
# copy-htmlスクリプトを確認
npm run copy-html

# エラーが出る場合、手動でコピー
cp src/nodes/*.html dist/nodes/
```

### 型エラーが多すぎる

一時的に型チェックを緩和する（推奨しません）：

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": false,  // 厳格モードをオフ
    "noImplicitAny": false
  }
}
```

### ソースマップでデバッグ

生成された`.js.map`ファイルを使用してデバッグ：

```bash
# dist/nodes/に*.js.mapが生成されていることを確認
ls -la dist/nodes/*.map

# Node-REDログでエラーが発生した場合、
# スタックトレースは元のTypeScriptファイルの行番号を示します
```

## まとめ

TypeScriptでのNode-REDカスタムノード開発のポイント：

1. **src/で開発、dist/で実行**: TypeScriptは`src/`、ビルド成果物は`dist/`
2. **型定義を活用**: `@types/node-red`で型安全な開発
3. **ビルドスクリプトで自動化**: `build-custom-nodes.sh`, `reload-custom-nodes.sh`
4. **package.jsonはdist参照**: `"nodes": { "my-node": "dist/nodes/my-node.js" }`
5. **HTMLはコピー**: HTMLファイルは`src/`から`dist/`へコピー
6. **watchモード**: 開発効率化のため`npm run watch`を活用

TypeScriptにより、型安全で保守性の高いカスタムノードを開発できます！
