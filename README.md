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

Node-REDの基本的な操作方法（フロー削除、デプロイ、プロジェクト機能など）については、[Node-RED使い方ガイド](docs/node-red-usage-guide.md)を参照してください。

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

### カテゴリ

- **基本（basic）** - Hello World、タイマー、デバッグ出力など
- **HTTP** - API作成、RESTクライアント、Webhookなど
- **データ処理（data-processing）** - JSON変換、CSVパース、データ変換など
- **連携（integration）** - ファイル操作、外部API、MQTT、メール通知など

### サンプルの使い方

1. `examples/` ディレクトリから使いたいサンプルを選択
2. `flow.json` ファイルの内容をコピー
3. Node-RED UIでメニュー（☰）→ インポートを選択
4. JSONを貼り付けてインポート
5. デプロイして実行

詳細は [examples/README.md](examples/README.md) を参照してください。

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
├── examples/               # 学習用サンプルフロー
│   ├── README.md           # サンプル一覧と使い方
│   ├── basic/              # 基本サンプル
│   ├── http/               # HTTPサンプル
│   ├── data-processing/    # データ処理サンプル
│   └── integration/        # 連携サンプル
├── scripts/
│   ├── start.sh            # Node-REDを起動
│   ├── stop.sh             # Node-REDを停止
│   └── reset.sh            # すべてのデータをリセット・削除
├── docs/                   # ドキュメント
│   ├── node-red-usage-guide.md        # Node-RED使い方ガイド
│   └── examples-implementation-plan.md # サンプル実装計画
├── README.md               # このファイル
└── LICENSE                 # MITライセンス
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

## ライセンス

このプロジェクトはMITライセンスの下でライセンスされています。詳細は[LICENSE](LICENSE)ファイルを参照してください。
