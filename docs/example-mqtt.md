# MQTT使用例

このドキュメントでは、Node-REDでMQTTを使用する方法と、温度センサーシミュレーターを使った実践例を説明します。

## 概要

MQTTは、軽量なメッセージングプロトコルで、IoTデバイスやセンサーからのデータ送受信に広く使われています。このプロジェクトでは、Mosquitto MQTTブローカーを使用して、Node-REDからMQTTメッセージを送受信できます。

## MQTT接続情報

### Node-REDからの接続（コンテナ内）

Node-REDフロー内で使用する接続情報：

| 項目 | 値 |
|------|-----|
| Server | `mosquitto` |
| Port | `1883` (標準MQTT) |
| Port | `9001` (MQTT over WebSocket) |
| プロトコル | `mqtt://` または `ws://` |

**接続URL:**
- 標準MQTT: `mqtt://mosquitto:1883`
- WebSocket: `ws://mosquitto:9001`

### ホストからの接続

ホストマシンから接続する場合：

| 項目 | 値 |
|------|-----|
| Server | `localhost` |
| Port | `1883` (標準MQTT、環境変数 `MQTT_PORT` で変更可能) |
| Port | `9901` (MQTT over WebSocket、環境変数 `MQTT_WS_PORT` で変更可能) |

## 温度センサーシミュレーター

学習・テスト用に、温度センサーを模したMQTTメッセージを生成するシミュレーターが用意されています。

### 機能

- 指定した間隔でランダムな温度値を生成
- タイムスタンプ付きJSONメッセージとして発行
- カスタマイズ可能な温度範囲とトピック

### 使い方

#### 基本的な使い方

デフォルト設定（5秒間隔、24.0-25.0°C、`sensors/temperature`トピック）で起動：

```bash
./scripts/start-temperature-simulator.sh
```

#### カスタマイズ

引数を指定してカスタマイズできます：

```bash
# 書式
./scripts/start-temperature-simulator.sh [INTERVAL] [TOPIC] [MIN_TEMP] [MAX_TEMP]
```

**例:**

```bash
# 3秒間隔で送信
./scripts/start-temperature-simulator.sh 3

# カスタムトピックを使用
./scripts/start-temperature-simulator.sh 5 room/temperature

# 温度範囲を20.0-30.0°Cに変更
./scripts/start-temperature-simulator.sh 5 sensors/temperature 20.0 30.0

# すべてカスタマイズ（10秒間隔、test/tempトピック、15.0-25.0°C）
./scripts/start-temperature-simulator.sh 10 test/temp 15.0 25.0
```

#### 停止方法

シミュレーターを停止するには、**Ctrl+C**を押してください。

### メッセージ形式

シミュレーターが生成するJSONメッセージの形式：

```json
{
  "temperature": 24.5,
  "timestamp": "2025-11-16T09:14:29Z",
  "unit": "celsius"
}
```

| フィールド | 説明 |
|-----------|------|
| `temperature` | 温度値（数値、小数点第1位まで） |
| `timestamp` | ISO 8601形式のUTCタイムスタンプ |
| `unit` | 単位（常に`"celsius"`） |

## Node-REDでMQTTメッセージを受信する

### 基本的なフロー

1. **mqtt inノードを配置**
   - パレットから「mqtt in」ノードをワークスペースにドラッグ

2. **Serverを設定**
   - ノードをダブルクリックして設定を開く
   - 「Server」の鉛筆アイコンをクリック
   - 以下のように設定：
     - **Server**: `mosquitto`
     - **Port**: `1883`
     - **Protocol**: `MQTT V3.1.1` または `MQTT V5`
     - 認証は不要（学習用設定）
   - 「Add」または「Update」をクリック

3. **Topicを設定**
   - **Topic**: `sensors/temperature`（またはシミュレーターで指定したトピック）
   - **QoS**: `0`（デフォルト）
   - **Output**: `a parsed JSON object`（自動的にJSONをパースする場合）
     - または `a String`（文字列として受信する場合）

4. **debugノードを接続**
   - 「debug」ノードを配置して、mqtt inノードの出力と接続
   - デプロイして動作を確認

### サンプルフロー

MQTT接続のサンプルフローは `examples/mqtt_websocket_example.json` に含まれています。

### フロー構成

```
[mqtt in] → [json] → [debug]
```

### ノードの説明

1. **mqtt in**
   - トピック `room/temperature` をサブスクライブ
   - QoS: 2（最高レベルの配信保証）
   - データタイプ: auto-detect（自動検出）
   - ブローカー: `mosquitto:1883`

2. **json**
   - 受信した文字列をJSONオブジェクトにパース
   - `msg.payload`をオブジェクト形式に変換

3. **debug**
   - パース後のJSONオブジェクトを表示

### インポート手順

1. `examples/mqtt_websocket_example.json`の内容をコピー
2. Node-REDのメニュー（☰）→「インポート」を選択
3. JSONを貼り付けて「インポート」をクリック
4. デプロイ
5. 温度センサーシミュレーターを起動：
   ```bash
   ./scripts/start-temperature-simulator.sh 5 room/temperature
   ```
6. デバッグタブで受信したメッセージを確認

## トラブルシューティング

### 接続できない

1. **Mosquittoコンテナが起動しているか確認**
   ```bash
   docker compose ps
   ```

2. **接続設定を確認**
   - Server: `mosquitto`（コンテナ名）
   - Port: `1883`

3. **ネットワークを確認**
   - すべてのコンテナが同じネットワーク（`nodered_net`）に接続されているか

### JSONがパースされない

mqtt inノードの設定で**Output**を確認：
- `a parsed JSON object` を選択すると自動的にパース
- `a String` を選択した場合は、JSONパーサーノードまたはFunctionノードで手動パース

## 参考資料

- [Node-RED MQTT ノードドキュメント](https://flows.nodered.org/node/node-red-contrib-mqtt-broker)
- [MQTT プロトコル仕様](https://mqtt.org/)
- [Eclipse Mosquitto](https://mosquitto.org/)
- [Node-RED使い方ガイド](node-red-usage-guide.md)

## 関連ドキュメント

- [README.md](../README.md) - プロジェクト全体の概要
- [FastAPI README](../docker/fastapi/README.md) - FastAPI使用例
- [カスタムノード開発ガイド](custom-node-development-typescript.md) - カスタムノード開発
