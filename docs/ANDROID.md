# Android 版（Google Play 公開までのメモ）

構成は techgymjp/jet-fighter の `docs/ANDROID_PORTING.md` と同じです（Capacitor 8 ＋ AdMob ＋ GitHub Actions）。

- パッケージ名：`jp.techgym.homerun`（Google Play に一度出すと変更できません）
- 画面の向き：縦（`sensorPortrait`）
- 広告：「もう一度」を押したとき 2 回に 1 回、インタースティシャル広告。試合終了画面の「広告を見て延長戦」でリワード広告（見終わると＋10球、1 試合 1 回）。バナーはなし。動作確認用 APK はテスト広告、Google Play 用 AAB だけ本番の広告
- 動作確認用 APK（テスト広告・デバッグ署名）：既定ブランチに push すると GitHub Actions がビルドし、Release `android-latest` に載せます
- スマホへの入れ方：下の QR コードで Release のページを開き、「Assets」の homerun.apk をタップする（ページが開いたら Chrome で表示する）

  `https://github.com/techgymjp/homerun/releases/tag/android-latest`

  ![Release ページの QR コード](release-page-qr.png)

  ファイルを直接ダウンロードする URL（`https://github.com/techgymjp/homerun/releases/latest/download/homerun.apk`、QR は [apk-qr.png](apk-qr.png)）は、端末によっては「ダウンロードしています」のまま止まることがありました（AQUOS で発生。Release のページからなら入れられた）

## アプリ版だけの動き

| 機能 | 内容 |
| --- | --- |
| 戻るボタン | プレイ中はポーズ／再開、タイトル・結果画面ではアプリを終了 |
| 別のアプリに切り替え | 自動でポーズして音を止める（Web 版も同じ） |
| シェア | Android の共有メニューを出す（X・LINE などを選べる） |
| 振動 | `VIBRATE` 権限を付けているので、Web 版と同じく打球時に振動する |
| タイトル画面 | バージョン（`v1.0.0 (build 12)` など）、プライバシーポリシー、「広告の設定」（同意が必要な地域のみ） |

## これからやること（画面での手続き）

1. ~~AdMob：アプリの追加・インタースティシャルの広告ユニット作成~~（済み。インタースティシャルとリワードの広告ユニットを作成し、ID は `strings.xml` の `admob_app_id` と `js/ads.js` の `UNITS.production` に設定済み）。「欧州の規制」のメッセージへの追加も済み
2. **GitHub Secrets**（Settings → Secrets and variables → Actions）：`ANDROID_KEYSTORE_BASE64` / `ANDROID_KEYSTORE_PASSWORD` / `ANDROID_KEY_ALIAS` / `ANDROID_KEY_PASSWORD`。登録すると、Actions が署名付き AAB を作って Artifact に上げます
3. **Play Console**：アプリを作成し、ストア掲載情報・アプリのコンテンツ（プライバシーポリシー https://techgym.jp/privacy-policy/ 、広告あり、広告 ID 使用など）を入力して、AAB をアップロードする

アップロード鍵（upload.jks）とパスワードは、チャットやリポジトリで共有しないでください。本番の広告を自分でタップしないでください（動作確認はテスト広告の APK で行う）。

## 手元でビルドする場合

```sh
npm ci
npm run build          # www/ に Web ファイルをコピー
npx cap sync android   # Android プロジェクトに反映
npx cap open android   # Android Studio で開く
```

アイコンと起動画面は `assets/` の元画像から `npx @capacitor/assets generate --android` で生成しています。
