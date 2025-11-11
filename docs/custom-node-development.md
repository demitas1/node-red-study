# Node-RED Custom Node Development Guide

Docker環境でのNode-REDカスタムノード開発手順をまとめます。

## ディレクトリ構成

```
node-red-study/
├── docker/
│   ├── docker-compose.yml
│   ├── data/                    # Node-REDデータ（既存）
│   ├── hostfiles/              # ホストファイル（既存）
│   ├── fastapi/
│   └── mosquitto/
├── custom-nodes/               # ★カスタムノード開発用（新規作成）
│   └── node-red-contrib-my-nodes/
│       ├── package.json
│       ├── nodes/
│       │   ├── timestamp-merge.js
│       │   ├── timestamp-merge.html
│       │   ├── data-filter.js
│       │   └── data-filter.html
│       └── icons/
├── scripts/
│   ├── start.sh
│   ├── stop.sh
│   ├── reset.sh
│   ├── install-custom-nodes.sh    # ★カスタムノードインストール用（新規作成）
│   └── reload-custom-nodes.sh     # ★開発時のリロード用（新規作成）
├── examples/
└── docs/
```

## 手順1: カスタムノード開発用ディレクトリ作成

```bash
# プロジェクトルートで実行
mkdir -p custom-nodes/node-red-contrib-my-nodes
cd custom-nodes/node-red-contrib-my-nodes
```

## 手順2: package.json を作成

以下の内容で `package.json` を作成：

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
  "node-red": {
    "nodes": {
      "timestamp-merge": "nodes/timestamp-merge.js",
      "data-filter": "nodes/data-filter.js"
    }
  }
}
```

**注意**: `node-red` セクションは、Node-REDにカスタムノードを認識させるための重要な設定です。

## 手順3: ノードファイルを作成

```bash
mkdir nodes
mkdir icons
```

### nodes/timestamp-merge.js

```javascript
module.exports = function(RED) {
    function TimestampMergeNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        
        node.latestTimestamp = null;
        
        node.on('input', function(msg, send, done) {
            send = send || function() { node.send.apply(node, arguments); };
            done = done || function(err) { if (err) node.error(err, msg); };
            
            if (msg.topic === 'timestamp' || msg._port === 0) {
                node.latestTimestamp = msg.payload;
                node.status({fill:"green", shape:"dot", text:"timestamp updated"});
                done();
            } 
            else if (msg.topic === 'string' || msg._port === 1) {
                if (node.latestTimestamp !== null) {
                    var outputMsg = {
                        payload: {
                            timestamp: node.latestTimestamp,
                            text: msg.payload
                        }
                    };
                    send(outputMsg);
                    node.status({fill:"blue", shape:"dot", text:"sent"});
                } else {
                    node.warn("No timestamp available");
                }
                done();
            }
        });
    }
    
    RED.nodes.registerType("timestamp-merge", TimestampMergeNode);
}
```

### nodes/timestamp-merge.html

```html
<script type="text/javascript">
    RED.nodes.registerType('timestamp-merge', {
        category: 'custom',
        color: '#a6bbcf',
        defaults: {
            name: {value: ""}
        },
        inputs: 2,
        outputs: 1,
        icon: "font-awesome/fa-clock-o",
        label: function() {
            return this.name || "timestamp merge";
        },
        inputLabels: ["timestamp", "string"],
        outputLabels: ["merged output"]
    });
</script>

<script type="text/html" data-template-name="timestamp-merge">
    <div class="form-row">
        <label for="node-input-name"><i class="fa fa-tag"></i> Name</label>
        <input type="text" id="node-input-name" placeholder="Name">
    </div>
</script>

<script type="text/html" data-help-name="timestamp-merge">
    <p>Merges the latest timestamp with a string</p>
    <h3>Inputs</h3>
    <dl class="message-properties">
        <dt>Input 1 (top)</dt>
        <dd>Receives timestamp value</dd>
        <dt>Input 2 (bottom)</dt>
        <dd>Receives string value</dd>
    </dl>
    <h3>Output</h3>
    <dl class="message-properties">
        <dt>payload</dt>
        <dd>Object containing timestamp and text properties</dd>
    </dl>
</script>
```

### nodes/data-filter.js

```javascript
module.exports = function(RED) {
    function DataFilterNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        
        node.threshold = config.threshold || 0;
        
        node.on('input', function(msg, send, done) {
            send = send || function() { node.send.apply(node, arguments); };
            done = done || function(err) { if (err) node.error(err, msg); };
            
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
    
    RED.nodes.registerType("data-filter", DataFilterNode);
}
```

### nodes/data-filter.html

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

## 手順4: docker-compose.yml を修正

`docker/docker-compose.yml` のカスタムノードディレクトリをマウント：

```yaml
services:
  nodered:
    image: nodered/node-red:latest
    container_name: nodered
    restart: unless-stopped
    user: "${PUID:-1000}:${PGID:-1000}"
    ports:
      - "${NODERED_PORT:-1880}:1880"
    volumes:
      - ./data:/data
      - ./hostfiles:/hostfiles
      - ../custom-nodes/node-red-contrib-my-nodes:/custom-nodes/node-red-contrib-my-nodes  # ★追加
    environment:
      - NODE_RED_ENABLE_PROJECTS=false
      - TZ=${TZ:-Asia/Tokyo}
    networks:
      - nodered_net
    depends_on:
      - fastapi
      - mosquitto

  # ... 以下同じ
```

**注意**:
- パスは `docker/` ディレクトリからの相対パス（`../custom-nodes/...`）
- コンテナ内では `/custom-nodes/...` にマウント

## 手順5: カスタムノードをインストール

### 方法A: インストールスクリプトを使用（推奨）

**注意**: このスクリプトは後述の手順で作成します。

```bash
# プロジェクトルートで実行
./scripts/install-custom-nodes.sh
```

このスクリプトは以下を自動的に実行します：
1. コンテナ内で npm install を実行
2. Node-REDコンテナを再起動
3. 完了メッセージとアクセスURLを表示

### 方法B: 手動でインストール

```bash
# コンテナに入る
docker exec -it nodered bash

# カスタムノードをインストール
cd /data
npm install /custom-nodes/node-red-contrib-my-nodes

# コンテナから出る
exit

# Node-REDを再起動（docker ディレクトリから実行）
cd docker
docker compose restart nodered
```

### 方法C: package.json に直接追加

`docker/data/package.json` を編集（なければ作成）：

```json
{
  "name": "node-red-project",
  "description": "Node-RED Project",
  "version": "0.0.1",
  "dependencies": {
    "node-red-contrib-my-nodes": "file:/custom-nodes/node-red-contrib-my-nodes"
  }
}
```

その後：

```bash
docker exec -it nodered bash
cd /data
npm install
exit

cd docker
docker compose restart nodered
```

## 手順6: 動作確認

1. ブラウザで `http://localhost:1880` を開く
2. 左側のパレットに「custom」カテゴリが追加されているか確認
3. 「timestamp merge」と「data filter」ノードが表示されているか確認

## 開発ワークフロー

### ノードを修正した場合

**方法A: リロードスクリプトを使用（推奨）**

```bash
# 1. ホスト側でファイルを編集
vim custom-nodes/node-red-contrib-my-nodes/nodes/timestamp-merge.js

# 2. リロードスクリプトを実行（変更を反映）
./scripts/reload-custom-nodes.sh

# 3. ブラウザをリロード（Ctrl+R / Cmd+R）
```

**方法B: 手動で再起動**

```bash
# 1. ホスト側でファイルを編集
vim custom-nodes/node-red-contrib-my-nodes/nodes/timestamp-merge.js

# 2. Node-REDを再起動（変更を反映）
cd docker
docker compose restart nodered

# 3. ブラウザをリロード（Ctrl+R / Cmd+R）
```

### 新しいノードを追加した場合

```bash
# 1. ノードファイルを作成
# custom-nodes/node-red-contrib-my-nodes/nodes/new-node.js
# custom-nodes/node-red-contrib-my-nodes/nodes/new-node.html

# 2. package.json を更新
vim custom-nodes/node-red-contrib-my-nodes/package.json
# "node-red": { "nodes": { "new-node": "nodes/new-node.js" } } を追加

# 3. インストールスクリプトを実行
./scripts/install-custom-nodes.sh

# または手動で再インストール
docker exec -it nodered bash
cd /data
npm install /custom-nodes/node-red-contrib-my-nodes
exit
cd docker
docker compose restart nodered
```

## 補助スクリプトの作成

開発を効率化するため、以下のスクリプトを作成します。

### scripts/install-custom-nodes.sh

カスタムノードをインストールして再起動するスクリプト：

```bash
#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_ROOT/docker"

echo "Installing custom nodes..."

# Check if container is running
if ! docker ps | grep -q nodered; then
    echo "✗ Node-RED container is not running"
    echo "Please start Node-RED first: ./scripts/start.sh"
    exit 1
fi

# Install custom nodes in container
echo "Running npm install in container..."
docker exec -it nodered bash -c "cd /data && npm install /custom-nodes/node-red-contrib-my-nodes"

# Restart Node-RED
echo "Restarting Node-RED..."
cd "$DOCKER_DIR"
docker compose restart nodered

# Wait for Node-RED to be ready
echo "Waiting for Node-RED to start..."
sleep 3

echo ""
echo "✓ Custom nodes installed successfully!"
echo ""
echo "Access Node-RED at: http://localhost:1880"
echo ""
```

実行権限を付与：
```bash
chmod +x scripts/install-custom-nodes.sh
```

### scripts/reload-custom-nodes.sh

ノード修正後にNode-REDを再起動するスクリプト：

```bash
#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_ROOT/docker"

echo "Reloading Node-RED..."

# Check if container is running
if ! docker ps | grep -q nodered; then
    echo "✗ Node-RED container is not running"
    echo "Please start Node-RED first: ./scripts/start.sh"
    exit 1
fi

# Restart Node-RED
cd "$DOCKER_DIR"
docker compose restart nodered

# Wait for Node-RED to be ready
echo "Waiting for Node-RED to start..."
sleep 3

echo ""
echo "✓ Node-RED reloaded successfully!"
echo ""
echo "Access Node-RED at: http://localhost:1880"
echo "Remember to refresh your browser (Ctrl+R / Cmd+R)"
echo ""
```

実行権限を付与：
```bash
chmod +x scripts/reload-custom-nodes.sh
```

## トラブルシューティング

### ノードが表示されない

```bash
# ログを確認
cd docker
docker compose logs nodered

# コンテナ内で確認
docker exec -it nodered bash
cd /data/node_modules
ls -la | grep node-red-contrib
exit
```

### パーミッションエラー

```bash
# ホスト側で権限を確認
ls -la custom-nodes/node-red-contrib-my-nodes/

# 必要に応じて権限を変更
chmod -R 755 custom-nodes/node-red-contrib-my-nodes/
```

### 完全にクリーンアップして再インストール

```bash
docker exec -it nodered bash
cd /data
rm -rf node_modules/node-red-contrib-my-nodes
npm install /custom-nodes/node-red-contrib-my-nodes
exit

cd docker
docker compose restart nodered
```

## 動作検証手順

カスタムノードが正しく動作するかを確認するための手順です。

### 1. 基本的な確認

```bash
# 1. Node-REDが起動していることを確認
./scripts/start.sh

# 2. カスタムノードをインストール
./scripts/install-custom-nodes.sh

# 3. ブラウザで http://localhost:1880 を開く
```

### 2. UI での確認

1. 左側のノードパレットをスクロール
2. 「custom」カテゴリが表示されているか確認
3. 「timestamp merge」と「data filter」ノードが表示されているか確認

### 3. timestamp-merge ノードのテスト

以下のフローを作成してテストします：

```
[inject (timestamp)] → [timestamp merge] → [debug]
                ↑
[inject (string)]
```

**手順**:
1. Inject ノード（上）を配置し、`msg.payload` を `timestamp` に設定
2. Inject ノード（下）を配置し、`msg.payload` を文字列（例: "Hello"）に設定
3. timestamp merge ノードを配置
4. Debug ノードを配置
5. 接続してデプロイ
6. 上のInjectボタンをクリック（タイムスタンプを送信）
7. 下のInjectボタンをクリック（文字列を送信）
8. Debugパネルで `{timestamp: ..., text: "Hello"}` が表示されることを確認

### 4. data-filter ノードのテスト

以下のフローを作成してテストします：

```
[inject (number)] → [data filter (threshold: 50)] → [debug]
```

**手順**:
1. Inject ノードを配置し、`msg.payload` を数値（例: 30, 70）に設定
2. data filter ノードを配置し、Threshold を 50 に設定
3. Debug ノードを配置
4. 接続してデプロイ
5. 30を送信 → Debugに何も表示されない（フィルタされる）
6. 70を送信 → Debugに 70 が表示される（通過）

### 5. ノード修正のテスト

```bash
# 1. ノードファイルを修正（例: メッセージを変更）
vim custom-nodes/node-red-contrib-my-nodes/nodes/timestamp-merge.js

# 2. リロードスクリプトを実行
./scripts/reload-custom-nodes.sh

# 3. ブラウザをリロード（Ctrl+R / Cmd+R）

# 4. 修正が反映されているか確認
```

### 6. 新しいノード追加のテスト

```bash
# 1. 新しいノードファイルを作成
# custom-nodes/node-red-contrib-my-nodes/nodes/test-node.js
# custom-nodes/node-red-contrib-my-nodes/nodes/test-node.html

# 2. package.json を更新
# "test-node": "nodes/test-node.js" を追加

# 3. インストールスクリプトを実行
./scripts/install-custom-nodes.sh

# 4. ブラウザで新しいノードが表示されるか確認
```

## まとめ

Docker環境でのカスタムノード開発のポイント：

1. **ホスト側で開発**: `custom-nodes/` ディレクトリで編集
2. **volumesでマウント**: `docker/docker-compose.yml` でコンテナに共有
3. **npm install で導入**: コンテナ内の `/data` で npm install
4. **スクリプトで効率化**:
   - `install-custom-nodes.sh` - 初回インストール・新規ノード追加時
   - `reload-custom-nodes.sh` - ノード修正時の再起動
5. **Git管理**: custom-nodes はGit管理対象、node_modules は除外

この方法なら、ホスト側でエディタを使って快適に開発でき、変更がすぐにコンテナに反映されます！
