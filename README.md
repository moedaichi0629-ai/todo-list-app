# ToDoリスト

ブラウザだけで使える、シンプルで見やすいToDoリストWebアプリです。

## アプリ概要

タスクの追加・完了・削除ができるシンプルなToDo管理アプリです。入力したタスクは`localStorage`に保存されるため、ブラウザを閉じたり再読み込みしたりしてもデータが消えません。

## アプリURL

https://todo-list-app-six-blue.vercel.app/

## 実装した機能

- タスクの追加(入力欄に文字を入れて「追加」ボタン、またはEnterキー)
- タスクの完了マーク(チェックボックスでON/OFF、完了時は取り消し線で表示)
- タスクの削除
- `localStorage`によるデータの永続化(ブラウザを閉じても消えない)
- 空文字・空白のみのタスクは追加できないようにするバリデーション
- 残りタスク数 / 全タスク数の表示

## 使用技術

- [Next.js](https://nextjs.org/)(App Router)
- JavaScript / React
- [Tailwind CSS](https://tailwindcss.com/)
- ブラウザ標準の`localStorage` API
- [Vercel](https://vercel.com/)(デプロイ)

## 機能一覧

| 機能 | 操作方法 | 補足 |
|---|---|---|
| タスク追加 | 入力欄にテキストを入力して「追加」ボタン、またはEnterキー | 空文字・空白のみは追加不可 |
| 完了マーク | タスク左のチェックボックスをクリック | 完了時は取り消し線＋文字色を薄く表示 |
| タスク削除 | タスク右の「削除」ボタンをクリック | 削除前の確認なしで即削除 |
| データ永続化 | 特別な操作は不要 | `localStorage`に自動保存され、リロード・再訪問後も保持 |
| 残数表示 | 特別な操作は不要 | 「残り○件 / 全○件」を一覧下部に表示 |

## 実装手順

1. `create-next-app`でNext.js(JavaScript / App Router / Tailwind CSS構成)のプロジェクトを作成
2. `app/page.js`にToDoアプリ本体を実装
   - `useState`でタスク一覧・入力値を管理
   - `useEffect`で初回マウント時に`localStorage`からタスクを読み込み
   - タスクの状態(`tasks`)が変化するたびに`localStorage`へ書き込み
   - 追加・完了切り替え・削除の各処理を実装
3. Tailwind CSSでカード型レイアウト・配色・レスポンシブ対応を調整
4. `npm run dev`でローカル動作確認、`npm run lint` / `npm run build`で品質チェック
5. Playwrightを使ってブラウザ操作(追加・完了・削除・リロード後の永続化・モバイル表示)を自動テストして動作確認
6. `git init` → コミット → GitHubに新規リポジトリを作成してpush
7. VercelでGitHubリポジトリをImportし、デプロイして公開URLを取得

## ディレクトリ構成

```
todo-list-app/
├── app/
│   ├── favicon.ico
│   ├── globals.css     # Tailwind CSSの読み込み・全体スタイル
│   ├── layout.js        # 全ページ共通のレイアウト・メタ情報(タイトル等)
│   └── page.js           # ToDoリスト本体(状態管理・追加/完了/削除・localStorage連携)
├── public/               # 画像などの静的ファイル
├── eslint.config.mjs     # ESLint設定
├── jsconfig.json         # パスエイリアス(@/*)などの設定
├── next.config.mjs       # Next.jsの設定
├── postcss.config.mjs    # Tailwind CSS用のPostCSS設定
├── package.json          # 依存パッケージ・npmスクリプト定義
└── README.md
```

## 工夫した点

- 中央寄せのカード型レイアウトで、フォームとタスク一覧を1画面に収めてわかりやすくした
- 完了したタスクは文字色を薄くし取り消し線を付けることで、一覧を見ただけで進捗がひと目でわかるようにした
- 削除ボタンを目立たせすぎない赤系の配色にし、誤操作時にも視認しやすくした
- タスクが1件もないときは案内メッセージを表示し、初めて使うユーザーが迷わないようにした
- スマートフォンの画面幅でもボタンや文字が崩れないようレスポンシブ対応した

## 起動方法

```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと動作を確認できます。

## 今後追加したい機能

- タスクの編集機能
- 完了/未完了でのタスクの絞り込み表示
- タスクのカテゴリ分け・タグ付け
- 期限日の設定とリマインド通知
- ドラッグ&ドロップによるタスクの並び替え

## 学んだこと

- Reactの`useEffect`で外部システム(ブラウザの`localStorage`)と状態を同期させる際の注意点。初回読み込み前に空配列で上書き保存してしまわないよう、読み込み完了フラグを持たせる必要があること
- Next.jsのApp Routerでのクライアントコンポーネント(`"use client"`)の使いどころ
- Tailwind CSSでレスポンシブデザインを組む際、要素を`flex`で並べると子要素が意図せず縮んでしまう(`shrink-0`が必要になる)ケースがあること
- GitHub CLI(`gh`)とVercelを連携させることで、コードのpushからデプロイまでの一連の流れをスムーズに行えること
