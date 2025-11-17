# Node-RED Study

DockerベースのNode-RED学習環境です。Node-REDのフローを学習・実験するために使用します。

## 機能

- DockerコンテナでNode-REDを実行
- 自動化スクリプトによる簡単なセットアップ
- フローと設定のデータ永続化
- ローカルファイルとの統合のためのホストファイルアクセス
- クリーンなリセット機能で新規状態から開始可能
- 学習用の外部サービス（FastAPI、MQTTブローカー）を統合

## 前提条件

- Docker
- Docker Compose

## クイックスタート

1. このリポジトリをクローン：
```bash
git clone <repository-url>
cd node-red-study
```

2. Node-REDを起動：
```bash
./scripts/start.sh
```

3. http://localhost:1880 でNode-REDにアクセス

## サービス一覧

起動すると、以下のサービスが利用可能になります：

| サービス | URL | 説明 |
|---------|-----|------|
| Node-RED | http://localhost:1880 | フロー開発環境 |
| FastAPI | http://localhost:8880 | サンプルREST API / WebSocket |
| FastAPI Docs | http://localhost:8880/docs | API自動ドキュメント（Swagger UI） |
| MQTT Broker | mqtt://localhost:1883 | MQTTブローカー（Mosquitto） |
| MQTT WebSocket | ws://localhost:9901 | MQTT over WebSocket |

### Node-REDからの接続

Node-REDフロー内からは、コンテナ名で接続できます：

- FastAPI: `http://fastapi:8000`
- MQTT: `mqtt://mosquitto:1883`
- MQTT WebSocket: `ws://mosquitto:9001`

**注意**: コンテナ間通信では、コンテナ内部のポート（8000, 1883, 9001）を使用します。ホスト側のポート設定（.envファイル）はホストマシンからのアクセス時のみ影響します。

## 使い方

### ドキュメント

- **[基本的なフローの例](docs/example-basic.md)** - Inject、Function、Debugノードの基本的な使い方とコンテキストの説明
- **[Node-RED使い方ガイド](docs/node-red-usage-guide.md)** - フロー削除、デプロイ、プロジェクト機能など
- **[MQTT使用例](docs/example-mqtt.md)** - MQTTブローカーの使用方法と温度センサーシミュレーター
- **[WebSocket使用例](docs/example-websocket.md)** - WebSocketの使用方法とFastAPIエコーエンドポイント

### Node-REDの起動
```bash
./scripts/start.sh
```
このスクリプトは以下を実行します：
- 必要なディレクトリ（`data`、`hostfiles`）を作成
- Node-REDコンテナを起動
- アクセスURLを表示

### Node-REDの停止
```bash
./scripts/stop.sh
```
すべてのデータを保持したままコンテナを停止します。

### すべてをリセット
```bash
./scripts/reset.sh
```
**警告**: コンテナを停止し、すべてのフロー、設定、カスタムノードを削除します。確認プロンプトが表示されます。

### ログの表示
```bash
cd docker
docker compose logs -f nodered
```

## サンプルフロー

このリポジトリには、Node-REDの学習用サンプルフローが含まれています（`examples/` ディレクトリ）。

### 利用可能なサンプル

- **basic_flow.json** - 基本的なフロー（Hello World、Functionノード、コンテキスト）
- **mqtt_websocket_example.json** - MQTTとWebSocketの使用例
- **custom_node_example.json** - カスタムノード（tokyo-weather、weather-formatter）の使用例

### サンプルの使い方

1. `examples/` ディレクトリから使いたいサンプルを選択
2. JSONファイルの内容をコピー
3. Node-RED UIでメニュー（☰）→ インポートを選択
4. JSONを貼り付けてインポート
5. デプロイして実行

各サンプルの詳細は、対応するドキュメント（`docs/example-*.md`）を参照してください。

## ディレクトリ構造

```
.
├── docker/
│   ├── docker-compose.yml   # Docker Compose設定
│   ├── env.example          # 環境変数のサンプル
│   ├── data/                # Node-REDデータ（フロー、設定）
│   ├── hostfiles/           # Node-REDからアクセス可能なホストファイル
│   ├── fastapi/             # FastAPIサービス
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   ├── README.md
│   │   └── app/             # FastAPIアプリケーション
│   └── mosquitto/           # MQTTブローカー
│       ├── config/          # Mosquitto設定
│       ├── data/            # MQTTデータ（永続化）
│       └── log/             # MQTTログ
├── custom-nodes/            # カスタムノード開発（TypeScript）
│   └── node-red-contrib-my-nodes/
│       ├── package.json     # TypeScript設定、ビルドスクリプト
│       ├── tsconfig.json    # TypeScript設定
│       ├── src/             # TypeScriptソース
│       │   └── nodes/       # ノード実装（.ts, .html）
│       ├── dist/            # ビルド成果物（Git除外）
│       └── icons/           # ノードアイコン
├── examples/                # 学習用サンプルフロー
│   ├── basic_flow.json      # 基本的なフロー例
│   ├── mqtt_websocket_example.json  # MQTT & WebSocket例
│   └── custom_node_example.json     # カスタムノード使用例
├── scripts/
│   ├── start.sh             # Node-REDを起動
│   ├── stop.sh              # Node-REDを停止
│   ├── reset.sh             # すべてのデータをリセット・削除
│   ├── build-custom-nodes.sh         # カスタムノードをビルド（TypeScript）
│   ├── install-custom-nodes.sh       # カスタムノードをインストール
│   ├── reload-custom-nodes.sh        # カスタムノードを再読み込み
│   ├── start-temperature-simulator.sh  # 温度センサーシミュレーター起動
│   └── simulation/          # シミュレーションスクリプト
│       └── mosquitto/       # Mosquittoコンテナ内で実行されるスクリプト
│           └── temperature-sensor.sh  # 温度センサーシミュレーター
├── docs/                    # ドキュメント
│   ├── images/              # ドキュメント用画像
│   ├── example-basic.md     # 基本的なフローの例
│   ├── example-mqtt.md      # MQTT使用例
│   ├── example-websocket.md # WebSocket使用例
│   ├── node-red-usage-guide.md                # Node-RED使い方ガイド
│   ├── custom-node-development-typescript.md  # カスタムノード開発ガイド（TypeScript）
│   └── node-based-programming-introduction.md # ノードベースプログラミング入門
├── README.md                # このファイル
├── CLAUDE.md                # Claude Code用プロジェクトガイド
└── LICENSE                  # MITライセンス
```

## 設定

### 環境変数

設定をカスタマイズする場合は、`docker/env.example`を`docker/.env`にコピーして編集してください：

```bash
cp docker/env.example docker/.env
# .envファイルを編集
```

主な設定項目：

| 変数 | デフォルト値 | 説明 |
|------|-------------|------|
| `PUID` | 1000 | コンテナプロセスのユーザーID |
| `PGID` | 1000 | コンテナプロセスのグループID |
| `TZ` | Asia/Tokyo | タイムゾーン |
| `NODERED_PORT` | 1880 | Node-REDのポート（ホスト側） |
| `FASTAPI_PORT` | 8880 | FastAPIのポート（ホスト側） |
| `MQTT_PORT` | 1883 | MQTTブローカーのポート（ホスト側） |
| `MQTT_WS_PORT` | 9901 | MQTT WebSocketのポート（ホスト側） |
| `FASTAPI_LOG_LEVEL` | info | FastAPIのログレベル |

### サービス設定

**Node-RED:**
- プロジェクト機能：デフォルトで無効
- 現在のユーザーとして実行（パーミッション問題なし）

**FastAPI:**
- 自動リロード有効（開発モード）
- 詳細は [docker/fastapi/README.md](docker/fastapi/README.md) を参照

**Mosquitto:**
- 匿名接続許可（学習用）
- 本番環境では認証を有効にしてください

詳細な設定変更は `docker/docker-compose.yml` を編集してください。

## データの永続化

すべてのNode-REDデータは `docker/data/` に保存されます：
- `flows.json` - フロー定義
- `settings.js` - Node-RED設定
- `node_modules/` - npmでインストールされたカスタムノード

`docker/hostfiles/` ディレクトリは、ホストシステムとNode-RED間でファイルを共有するために使用できます。

## カスタムノード開発

このプロジェクトでは、TypeScriptを使用してNode-REDのカスタムノードを開発できます。

### クイックスタート

```bash
# カスタムノードをビルド
./scripts/build-custom-nodes.sh

# カスタムノードをインストール
./scripts/install-custom-nodes.sh

# カスタムノードを修正後、再読み込み
./scripts/reload-custom-nodes.sh
```

### 開発環境

- **言語**: TypeScript
- **ソース**: `custom-nodes/node-red-contrib-my-nodes/src/nodes/`
- **ビルド成果物**: `custom-nodes/node-red-contrib-my-nodes/dist/nodes/`

### 提供されているカスタムノード

このプロジェクトには以下のカスタムノードが含まれています：

1. **tokyo-weather** - 東京天気情報取得ノード
   - Open-Meteo APIから東京の現在の天気情報を定期的に取得
   - 気温、湿度、天気コード、風速などをJSON形式で出力
   - デフォルト10秒間隔で自動更新

2. **weather-formatter** - 天気情報フォーマットノード
   - tokyo-weatherノードの出力を読みやすい日本語形式に変換
   - 時刻、日付、天気情報を日本語テキストとして出力
   - 天気コードを日本語の天気説明に変換（快晴、晴れ、曇り、雨など）

### 詳細ガイド

カスタムノード開発の詳細は以下のドキュメントを参照してください：

- **[TypeScript開発ガイド](docs/custom-node-development-typescript.md)**
  - TypeScript環境のセットアップ
  - 型定義とベストプラクティス
  - サンプル実装（tokyo-weather, weather-formatter）
  - トラブルシューティング

## ライセンス

このプロジェクトはMITライセンスの下でライセンスされています。詳細は[LICENSE](LICENSE)ファイルを参照してください。
