# WebSocket使用例

このドキュメントでは、Node-REDでWebSocketを使用する方法と、FastAPIのWebSocketエコー機能を使った実践例を説明します。

## 概要

WebSocketは、クライアントとサーバー間で双方向のリアルタイム通信を実現するプロトコルです。HTTPと異なり、一度接続を確立すると、クライアントとサーバーの両方から自由にメッセージを送受信できます。

このプロジェクトでは、FastAPIサービスがWebSocketエコーエンドポイントを提供しており、Node-REDからWebSocket通信を学習できます。

## WebSocket接続情報

### Node-REDからの接続（コンテナ内）

Node-REDフロー内で使用する接続情報：

| 項目 | 値 |
|------|-----|
| Server | `fastapi` |
| Port | `8000` |
| Path | `/ws` |
| プロトコル | `ws://` |

**接続URL:**
```
ws://fastapi:8000/ws
```

### ホストからの接続

ホストマシンからWebSocketに接続する場合：

| 項目 | 値 |
|------|-----|
| Server | `localhost` |
| Port | `8880` (環境変数 `FASTAPI_PORT` で変更可能) |
| Path | `/ws` |
| プロトコル | `ws://` |

**接続URL:**
```
ws://localhost:8880/ws
```

## FastAPI WebSocketエコーエンドポイント

### `/ws` - JSONエコーエンドポイント

受信したテキストメッセージをJSON形式で返すシンプルなエコーエンドポイントです。

#### 動作

1. クライアントからテキストメッセージを受信
2. サーバーがJSON形式でエコーバック
3. タイムスタンプを付与

#### メッセージ形式

**送信（クライアント → サーバー）:**
```
Hello World
```

**受信（サーバー → クライアント）:**
```json
{
  "type": "echo",
  "message": "Hello World",
  "timestamp": "2025-11-16T10:00:00.123456"
}
```

| フィールド | 説明 |
|-----------|------|
| `type` | メッセージタイプ（常に`"echo"`） |
| `message` | エコーバックされた元のメッセージ |
| `timestamp` | サーバー側のISO 8601形式タイムスタンプ |

## ホストからコマンドラインでテストする

### 方法1: `wscat`を使用（推奨）

Node.jsがインストールされている場合、`wscat`が最も簡単です。

#### インストール

```bash
npm install -g wscat
```

#### 使用方法

```bash
# 接続
wscat -c ws://localhost:8880/ws

# 接続後、メッセージを入力してEnterを押す
```

#### 実行例

```bash
$ wscat -c ws://localhost:8880/ws
Connected (press CTRL+C to quit)
> Hello World
< {"type":"echo","message":"Hello World","timestamp":"2025-11-16T10:00:00.123456"}
> Test message
< {"type":"echo","message":"Test message","timestamp":"2025-11-16T10:00:05.456789"}
> Node-RED WebSocket test
< {"type":"echo","message":"Node-RED WebSocket test","timestamp":"2025-11-16T10:00:10.789012"}
```

終了するには`Ctrl+C`を押します。

### 方法2: `websocat`を使用

`websocat`はWebSocket専用のコマンドラインツールです。

#### インストール

```bash
# Ubuntu/Debian
sudo apt install websocat

# macOS
brew install websocat
```

#### 使用方法

```bash
# 接続
websocat ws://localhost:8880/ws

# 接続後、メッセージを入力してEnterを押す
```

#### 実行例

```bash
$ websocat ws://localhost:8880/ws
Hello from websocat
{"type":"echo","message":"Hello from websocat","timestamp":"2025-11-16T10:00:00.123456"}
```

### 方法3: Pythonスクリプト

プログラムでWebSocketをテストする場合に便利です。

#### スクリプト例

```python
#!/usr/bin/env python3
"""
WebSocket echo test script for FastAPI /ws endpoint
"""
import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8880/ws"

    async with websockets.connect(uri) as websocket:
        print(f"Connected to {uri}")

        # Send messages
        messages = ["Hello", "WebSocket", "Test"]

        for msg in messages:
            await websocket.send(msg)
            print(f"Sent: {msg}")

            response = await websocket.recv()
            data = json.loads(response)
            print(f"Received: {json.dumps(data, indent=2)}")
            print()

if __name__ == "__main__":
    # Install: pip install websockets
    asyncio.run(test_websocket())
```

#### 実行

```bash
# websocketsライブラリをインストール
pip install websockets

# スクリプトを実行
python3 test_websocket.py
```

## Node-REDでWebSocketを使用する

### 基本的なフロー

1. **websocket outノードを配置**
   - パレットから「websocket out」ノードをワークスペースにドラッグ

2. **WebSocket設定を作成**
   - ノードをダブルクリックして設定を開く
   - 「Type」: `Connect to`（クライアントモード）
   - 「URL」の鉛筆アイコンをクリック
   - 以下のように設定：
     - **URL**: `ws://fastapi:8000/ws`
     - **Send/Receive**: `entire message object`
   - 「Add」または「Update」をクリック

3. **websocket inノードを配置**
   - 同じWebSocket設定を使用
   - 受信したメッセージを処理

4. **injectノードとdebugノードを接続**
   - 送信: inject → websocket out
   - 受信: websocket in → debug

### サンプルフロー（JSON）

以下のJSONをインポートして、すぐに試すことができます：

```json
[
    {
        "id": "websocket-example-tab",
        "type": "tab",
        "label": "WebSocket Echo Example",
        "disabled": false,
        "info": ""
    },
    {
        "id": "inject-message",
        "type": "inject",
        "z": "websocket-example-tab",
        "name": "Send Message",
        "props": [
            {
                "p": "payload"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "Hello from Node-RED",
        "payloadType": "str",
        "x": 140,
        "y": 100,
        "wires": [["websocket-out"]]
    },
    {
        "id": "websocket-out",
        "type": "websocket out",
        "z": "websocket-example-tab",
        "name": "Send to FastAPI",
        "server": "",
        "client": "websocket-client",
        "x": 360,
        "y": 100,
        "wires": []
    },
    {
        "id": "websocket-in",
        "type": "websocket in",
        "z": "websocket-example-tab",
        "name": "Receive from FastAPI",
        "server": "",
        "client": "websocket-client",
        "x": 170,
        "y": 180,
        "wires": [["debug-response", "parse-response"]]
    },
    {
        "id": "debug-response",
        "type": "debug",
        "z": "websocket-example-tab",
        "name": "Raw Response",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 430,
        "y": 160,
        "wires": []
    },
    {
        "id": "parse-response",
        "type": "json",
        "z": "websocket-example-tab",
        "name": "Parse JSON",
        "property": "payload",
        "action": "",
        "pretty": false,
        "x": 410,
        "y": 200,
        "wires": [["extract-message"]]
    },
    {
        "id": "extract-message",
        "type": "function",
        "z": "websocket-example-tab",
        "name": "Extract Message",
        "func": "// Extract echoed message and timestamp\nif (msg.payload && msg.payload.message) {\n    msg.payload = {\n        echoed: msg.payload.message,\n        timestamp: msg.payload.timestamp,\n        type: msg.payload.type\n    };\n}\nreturn msg;",
        "outputs": 1,
        "timeout": 0,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 610,
        "y": 200,
        "wires": [["debug-extracted"]]
    },
    {
        "id": "debug-extracted",
        "type": "debug",
        "z": "websocket-example-tab",
        "name": "Extracted Data",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 820,
        "y": 200,
        "wires": []
    },
    {
        "id": "websocket-client",
        "type": "websocket-client",
        "path": "ws://fastapi:8000/ws",
        "tls": "",
        "wholemsg": "true",
        "hb": "0",
        "hbInterval": "15"
    }
]
```

### フローの説明

このサンプルフローには、以下のノードが含まれています：

1. **inject (Send Message)**
   - ボタンをクリックして「Hello from Node-RED」を送信

2. **websocket out (Send to FastAPI)**
   - FastAPIのWebSocketエンドポイントにメッセージを送信

3. **websocket in (Receive from FastAPI)**
   - FastAPIからのエコーレスポンスを受信

4. **debug (Raw Response)**
   - 受信した生のJSONレスポンスを表示

5. **json (Parse JSON)**
   - JSON文字列をオブジェクトにパース

6. **function (Extract Message)**
   - エコーされたメッセージとタイムスタンプを抽出

7. **debug (Extracted Data)**
   - 抽出されたデータを表示

### インポート手順

1. 上記のJSONをコピー
2. Node-REDのメニュー（☰）→「インポート」を選択
3. JSONを貼り付けて「インポート」をクリック
4. デプロイ
5. 「Send Message」injectノードのボタンをクリック
6. デバッグタブで受信したメッセージを確認

## 応用例

### 双方向チャット

WebSocketを使用して、双方向の通信を実装：

```
[inject] → [websocket out] → FastAPI
FastAPI → [websocket in] → [debug]
```

### 定期的なメッセージ送信

一定間隔でメッセージを送信して、リアルタイム通信をシミュレート：

```
[inject: interval 5s] → [function: Add timestamp] → [websocket out]
```

**Functionノード例:**

```javascript
msg.payload = `Message at ${new Date().toISOString()}`;
return msg;
```

### メッセージカウンター

送受信したメッセージ数をカウント：

```
[websocket in] → [function: Count messages] → [debug]
```

**Functionノード例:**

```javascript
// Initialize counter in context
let count = context.get('count') || 0;
count++;
context.set('count', count);

msg.payload = {
    count: count,
    message: msg.payload
};

return msg;
```

### エラーハンドリング

WebSocket接続エラーを処理：

```
[websocket in] → [switch: Check status] → [debug: Connected]
                                        → [debug: Error]
```

## WebSocket接続状態の管理

### 接続状態の確認

WebSocketノードのステータスで接続状態を確認できます：

- **緑の丸**: 接続中
- **黄色の丸**: 接続試行中
- **赤の丸**: 切断/エラー

### 自動再接続

Node-REDのWebSocketノードは、接続が切断された場合に自動的に再接続を試みます。

### 手動で再接続

1. ノードを無効化（ノードをダブルクリック → 「無効化」）
2. デプロイ
3. ノードを有効化
4. デプロイ

## トラブルシューティング

### 接続できない

1. **FastAPIコンテナが起動しているか確認**
   ```bash
   docker compose ps
   ```

2. **URLを確認**
   - Node-REDから: `ws://fastapi:8000/ws`
   - ホストから: `ws://localhost:8880/ws`

3. **ポート番号を確認**
   - コンテナ内部: 8000（固定）
   - ホスト側: 8880（`FASTAPI_PORT`で変更可能）

4. **ネットワークを確認**
   - すべてのコンテナが同じネットワーク（`nodered_net`）に接続されているか

### メッセージが受信できない

1. **websocket inノードが配置されているか確認**
   - websocket outだけでは受信できません

2. **同じWebSocket設定を使用しているか確認**
   - websocket outとwebsocket inで同じクライアント設定を使用

3. **デバッグノードが有効になっているか確認**
   - デバッグノードの右側のボタンが緑色になっているか

### JSONがパースされない

1. **受信データの形式を確認**
   - FastAPIの`/ws`はJSON文字列を返します

2. **JSONノードを使用**
   - `msg.payload`がJSON文字列の場合、JSONノードでパース

3. **Functionノードで手動パース**
   ```javascript
   msg.payload = JSON.parse(msg.payload);
   return msg;
   ```

### 接続が頻繁に切断される

1. **FastAPIのログを確認**
   ```bash
   docker compose logs -f fastapi
   ```

2. **ネットワークの安定性を確認**
   - コンテナ間通信が安定しているか

3. **ハートビート設定を調整**
   - WebSocket設定で「Heartbeat」間隔を調整（デフォルト: 15秒）

## WebSocketとHTTPの違い

| 項目 | HTTP | WebSocket |
|------|------|-----------|
| 接続 | リクエストごとに新規接続 | 一度接続を確立し、維持 |
| 通信 | 単方向（クライアント → サーバー） | 双方向（両方から送信可能） |
| オーバーヘッド | 各リクエストでヘッダーを送信 | 初回のみハンドシェイク |
| 用途 | 通常のAPI呼び出し | リアルタイム通信、ストリーミング |
| Node-REDノード | `http request` | `websocket in/out` |

## 参考資料

- [Node-RED WebSocket ノードドキュメント](https://nodered.org/docs/user-guide/nodes#websocket)
- [FastAPI WebSocket ドキュメント](https://fastapi.tiangolo.com/advanced/websockets/)
- [WebSocket プロトコル仕様](https://datatracker.ietf.org/doc/html/rfc6455)
- [wscat (GitHub)](https://github.com/websockets/wscat)
- [websocat (GitHub)](https://github.com/vi/websocat)

## 関連ドキュメント

- [README.md](../README.md) - プロジェクト全体の概要
- [FastAPI README](../docker/fastapi/README.md) - FastAPI使用例
- [MQTT使用例](example-mqtt.md) - MQTT通信の例
- [Node-RED使い方ガイド](node-red-usage-guide.md) - Node-RED基本操作
