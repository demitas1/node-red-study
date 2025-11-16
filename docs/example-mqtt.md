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

### サンプルフロー（JSON）

以下のJSONをインポートして、すぐに試すことができます：

```json
[
    {
        "id": "mqtt-example-tab",
        "type": "tab",
        "label": "MQTT Temperature Example",
        "disabled": false,
        "info": ""
    },
    {
        "id": "mqtt-in-temp",
        "type": "mqtt in",
        "z": "mqtt-example-tab",
        "name": "Temperature Sensor",
        "topic": "sensors/temperature",
        "qos": "0",
        "datatype": "json",
        "broker": "mqtt-broker",
        "nl": false,
        "rap": true,
        "rh": 0,
        "inputs": 0,
        "x": 170,
        "y": 100,
        "wires": [["debug-temp", "process-temp"]]
    },
    {
        "id": "debug-temp",
        "type": "debug",
        "z": "mqtt-example-tab",
        "name": "Raw Message",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 420,
        "y": 80,
        "wires": []
    },
    {
        "id": "process-temp",
        "type": "function",
        "z": "mqtt-example-tab",
        "name": "Extract Temperature",
        "func": "// Extract temperature and timestamp\nmsg.payload = {\n    temp: msg.payload.temperature,\n    time: msg.payload.timestamp,\n    tempF: (msg.payload.temperature * 9/5) + 32  // Convert to Fahrenheit\n};\nreturn msg;",
        "outputs": 1,
        "timeout": 0,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 430,
        "y": 120,
        "wires": [["debug-processed"]]
    },
    {
        "id": "debug-processed",
        "type": "debug",
        "z": "mqtt-example-tab",
        "name": "Processed Data",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 660,
        "y": 120,
        "wires": []
    },
    {
        "id": "mqtt-broker",
        "type": "mqtt-broker",
        "name": "Mosquitto Broker",
        "broker": "mosquitto",
        "port": "1883",
        "clientid": "",
        "autoConnect": true,
        "usetls": false,
        "protocolVersion": "4",
        "keepalive": "60",
        "cleansession": true,
        "autoUnsubscribe": true,
        "birthTopic": "",
        "birthQos": "0",
        "birthRetain": "false",
        "birthPayload": "",
        "birthMsg": {},
        "closeTopic": "",
        "closeQos": "0",
        "closeRetain": "false",
        "closePayload": "",
        "closeMsg": {},
        "willTopic": "",
        "willQos": "0",
        "willRetain": "false",
        "willPayload": "",
        "willMsg": {},
        "userProps": "",
        "sessionExpiry": ""
    }
]
```

### フローの説明

このサンプルフローには、以下のノードが含まれています：

1. **mqtt in (Temperature Sensor)**
   - トピック `sensors/temperature` をサブスクライブ
   - JSONを自動的にパース

2. **debug (Raw Message)**
   - 受信した生データを表示

3. **function (Extract Temperature)**
   - 温度データを抽出し、摂氏から華氏に変換

4. **debug (Processed Data)**
   - 処理後のデータを表示

### インポート手順

1. 上記のJSONをコピー
2. Node-REDのメニュー（☰）→「インポート」を選択
3. JSONを貼り付けて「インポート」をクリック
4. デプロイ
5. 温度センサーシミュレーターを起動：
   ```bash
   ./scripts/start-temperature-simulator.sh
   ```
6. デバッグタブで受信したメッセージを確認

## 応用例

### 温度の監視とアラート

特定の温度を超えた場合にアラートを出すフロー：

```
[mqtt in] → [function: Check Threshold] → [switch] → [debug: High Temp Alert]
                                                    → [debug: Normal]
```

**Functionノード例:**

```javascript
const threshold = 24.8;
const temp = msg.payload.temperature;

msg.alert = temp > threshold;
msg.payload.status = msg.alert ? "HIGH" : "NORMAL";

return msg;
```

### データの蓄積

受信したデータをファイルに保存：

```
[mqtt in] → [function: Format CSV] → [file] → [debug]
```

### 複数のトピックをサブスクライブ

ワイルドカード（`+`、`#`）を使用：

- `sensors/+` - `sensors/`配下のすべての単一レベル（`sensors/temperature`, `sensors/humidity`など）
- `sensors/#` - `sensors/`配下のすべてのレベル（`sensors/room1/temperature`, `sensors/room2/humidity`など）

## MQTTメッセージを送信する

### mqtt outノードを使用

1. **mqtt outノードを配置**
2. **Serverを設定**（mqtt inと同じブローカー設定を使用）
3. **Topicを設定**
   - 送信先のトピックを指定
4. **QoSとRetainを設定**
   - **QoS**: メッセージの配信保証レベル（0, 1, 2）
   - **Retain**: ブローカーにメッセージを保持させるか

### 送信例

```
[inject] → [function: Create Message] → [mqtt out]
```

**Functionノード例:**

```javascript
msg.payload = {
    temperature: 25.5,
    timestamp: new Date().toISOString(),
    unit: "celsius"
};

msg.topic = "sensors/custom";

return msg;
```

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

### メッセージが受信できない

1. **トピック名を確認**
   - シミュレーターとNode-REDで同じトピックを使用しているか

2. **デバッグノードが有効になっているか確認**
   - デバッグノードの右側のボタンが緑色になっているか

3. **シミュレーターが動作しているか確認**
   - ターミナルに「Published:」メッセージが表示されているか

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
