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

### `wscat`を使用

Node.jsがインストールされている場合、`wscat`を使用してWebSocket接続をテストできます。

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

### サンプルフロー

WebSocket接続のサンプルフローは `examples/mqtt_websocket_example.json` に含まれています。

### フロー構成

```
[inject] → [websocket out]

[websocket in] → [debug]
```

### ノードの説明

1. **inject**
   - ボタンをクリックして「Hello」を送信
   - `payload`: `"Hello"`（文字列）

2. **websocket out**
   - FastAPIのWebSocketエンドポイントにメッセージを送信
   - 接続先: `ws://nodered_fastapi:8000/ws`
   - 送受信: `entire message object`を送信しない（`false`）

3. **websocket in**
   - FastAPIからのエコーレスポンスを受信
   - 同じWebSocketクライアント設定を使用

4. **debug**
   - 受信したメッセージを表示

### インポート手順

1. `examples/mqtt_websocket_example.json`の内容をコピー
2. Node-REDのメニュー（☰）→「インポート」を選択
3. JSONを貼り付けて「インポート」をクリック
4. デプロイ
5. injectノードのボタンをクリック
6. デバッグタブで受信したメッセージを確認

**注意**: WebSocket接続先が `ws://nodered_fastapi:8000/ws` になっています。これはDockerコンテナ名を使用した接続です。

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
