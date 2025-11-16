# Node-RED Custom Node Development with TypeScript

TypeScriptを使用したNode-REDカスタムノード開発手順をまとめます。

## 目次

- [概要](#概要)
- [TypeScriptを使用する理由](#typescriptを使用する理由)
- [ディレクトリ構成](#ディレクトリ構成)
- [開発ワークフロー](#開発ワークフロー)
- [実装例](#実装例)
- [トラブルシューティング](#トラブルシューティング)

## 概要

このプロジェクトでは、Node-REDカスタムノードをTypeScriptで開発しています。TypeScriptをJavaScriptにトランスパイルし、Node-REDで実行します。

**重要な制限事項**: Node-REDではカスタムノードで複数の物理的な入力ポートはサポートされていません。`inputs`プロパティの有効な値は`0`または`1`のみです。

## TypeScriptを使用する理由

### メリット

1. **型安全性**: コンパイル時に型エラーを検出
2. **IDE補完**: より良い開発体験
3. **保守性**: 大規模なノード開発に有利

### デメリット

1. **ビルドステップの追加**: 開発フローが若干複雑化
2. **学習コスト**: TypeScript自体の学習が必要

## ディレクトリ構成

```
custom-nodes/node-red-contrib-my-nodes/
├── package.json            # ノード登録、ビルドスクリプト
├── tsconfig.json           # TypeScriptコンパイル設定
├── .gitignore             # dist/などを除外
├── src/                    # TypeScriptソース
│   └── nodes/
│       ├── *.ts           # バックエンド実装
│       └── *.html         # フロントエンド定義
├── dist/                   # ビルド成果物（Git除外）
│   └── nodes/
│       ├── *.js
│       ├── *.html
│       └── *.js.map
└── icons/
```

**重要ポイント**:
- ソースは`src/`、ビルド成果物は`dist/`
- `package.json`の`node-red.nodes`は`dist/`を参照
- HTMLファイルは`src/`から`dist/`へコピー

## 開発ワークフロー

### 初回インストール

```bash
# ノードを実装（src/nodes/*.ts, *.html）

# package.jsonを更新（新しいノードを追加した場合）

# インストールスクリプトを実行
./scripts/install-custom-nodes.sh
```

### ノードの修正

```bash
# TypeScriptファイルを編集
vim custom-nodes/node-red-contrib-my-nodes/src/nodes/your-node.ts

# リロードスクリプトを実行
./scripts/reload-custom-nodes.sh

# ブラウザをリフレッシュ（Ctrl+R / Cmd+R）
```

### ビルドのみ実行

```bash
# TypeScriptをJavaScriptにコンパイル（Node-RED再起動なし）
./scripts/build-custom-nodes.sh
```

### 新しいノードの追加

```bash
# 1. TypeScriptとHTMLファイルを作成
touch src/nodes/new-node.ts
touch src/nodes/new-node.html

# 2. ファイルを実装

# 3. package.jsonを更新
# "node-red": {
#   "nodes": {
#     "new-node": "dist/nodes/new-node.js"  ← 追加
#   }
# }

# 4. インストールスクリプトを実行
./scripts/install-custom-nodes.sh
```

## 実装例

このプロジェクトには以下のカスタムノードが含まれています：

1. **tokyo-weather** (`src/nodes/tokyo-weather.ts`, `.html`)
   - 入力ポートなし（`inputs: 0`）
   - Open-Meteo APIから天気情報を取得
   - curlコマンドを使用したHTTPリクエストの例
   - 定期実行（setInterval）の例

2. **weather-formatter** (`src/nodes/weather-formatter.html`, `.html`)
   - 入力ポート1つ（`inputs: 1`）
   - データ変換処理の例
   - 日本語フォーマットの例

**実装の詳細は、`custom-nodes/node-red-contrib-my-nodes/src/nodes/`ディレクトリ内のソースコードを参照してください。**

### 基本的な型定義

Node-REDカスタムノードのTypeScript実装で使用する主要な型：

```typescript
import { Node, NodeDef, NodeAPI, NodeMessage } from 'node-red';

// ノード設定の型
interface MyNodeConfig extends NodeDef {
  interval: number;  // 設定項目
}

// ノード実装
module.exports = function (RED: NodeAPI) {
  function MyNode(this: Node, config: MyNodeConfig) {
    RED.nodes.createNode(this, config);
    const node = this;

    // ノードロジック
    node.on('input', (msg: NodeMessage) => {
      // メッセージ処理
      node.send(msg);
    });
  }

  RED.nodes.registerType('my-node', MyNode);
};
```

## トラブルシューティング

### ノードが表示されない

```bash
# 1. ビルドが成功しているか確認
cd custom-nodes/node-red-contrib-my-nodes
npm run build

# 2. dist/にファイルが生成されているか確認
ls -la dist/nodes/

# 3. Node-REDログを確認
docker logs nodered --tail 50

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
    }
  }
}
```

### 型エラー

```bash
# TypeScript型定義が不足している場合
npm install --save-dev @types/node-red

# node_modulesを再インストール
rm -rf node_modules package-lock.json
npm install
```

### 正しい型名を使用

```typescript
// ✅ 正しい
import { NodeAPI } from 'node-red';
module.exports = function(RED: NodeAPI) { ... }
```

## まとめ

TypeScriptでのNode-REDカスタムノード開発のポイント：

1. **src/で開発、dist/で実行**: TypeScriptは`src/`、ビルド成果物は`dist/`
2. **型定義を活用**: `@types/node-red`で型安全な開発
3. **ビルドスクリプトで自動化**: `build-custom-nodes.sh`, `reload-custom-nodes.sh`
4. **package.jsonはdist参照**: `"nodes": { "my-node": "dist/nodes/my-node.js" }`
5. **実装例を参照**: `src/nodes/`ディレクトリ内のソースコードを参考に

TypeScriptにより、型安全で保守性の高いカスタムノードを開発できます。
