# FastAPI サービス

Node-RED学習用のサンプルAPIサービスです。HTTP APIとWebSocketエンドポイントを提供します。

## 機能

- RESTful API（CRUD操作）
- WebSocketエンドポイント（シンプルなエコー）
- 自動ドキュメント生成（Swagger UI / ReDoc）

## アクセス

サービスが起動すると、以下のURLでアクセスできます：

- **API**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## エンドポイント

### HTTP エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/` | API情報 |
| GET | `/health` | ヘルスチェック |
| GET | `/time` | サーバー時刻 |
| GET | `/items` | アイテム一覧取得 |
| POST | `/items` | アイテム作成 |
| GET | `/items/{item_id}` | アイテム取得 |
| PUT | `/items/{item_id}` | アイテム更新 |
| DELETE | `/items/{item_id}` | アイテム削除 |
| POST | `/echo` | メッセージエコー |

### WebSocket エンドポイント

| パス | 説明 |
|------|------|
| `/ws` | シンプルなエコーWebSocket |

## 使用例

### cURLでのHTTPリクエスト

```bash
# ヘルスチェック
curl http://localhost:8000/health

# アイテム作成
curl -X POST http://localhost:8000/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Sample Item","description":"Test","price":100.0,"quantity":5}'

# アイテム一覧取得
curl http://localhost:8000/items

# アイテム取得
curl http://localhost:8000/items/1
```

### Node-REDからの接続

**HTTPリクエスト例:**
- `http request`ノードを使用
- URL: `http://fastapi:8000/items`（コンテナ名で接続）
- Method: GET / POST / PUT / DELETE

**WebSocket接続例:**
- `websocket`ノードを使用
- URL: `ws://fastapi:8000/ws`

## 開発

### ローカルでの実行

```bash
cd docker/fastapi
pip install -r requirements.txt
cd app
uvicorn main:app --reload
```

### コードの変更

`docker/fastapi/app/main.py`を編集すると、コンテナ内で自動的にリロードされます（`--reload`オプション有効）。

## 注意事項

- このAPIは学習用です。本番環境では使用しないでください
- データはメモリ上に保存され、コンテナ再起動で消えます
- 認証機能はありません
