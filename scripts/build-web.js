// Android アプリに同梱する Web ファイルを www/ にコピーする
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'www');
fs.rmSync(out, { recursive: true, force: true });
for (const item of ['index.html', 'js']) {
  const src = path.join(root, item);
  if (fs.existsSync(src)) fs.cpSync(src, path.join(out, item), { recursive: true });
}
// iOS アプリには Web 版専用の部分（Google Play へのリンクなど）を同梱しない。
// 「隠す」のではなく取り除く（App Store の審査で、隠された機能や他のプラットフォームへの言及と見なされないように）
const platform = process.env.APP_PLATFORM || 'web';
if (platform === 'ios') {
  const file = path.join(out, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const before = html.length;
  html = html.replace(/[ \t]*<!-- web-only[\s\S]*?<!-- \/web-only -->\n?/g, '');
  html = html.replace(/[ \t]*\/\* web-only \*\/[\s\S]*?\/\* \/web-only \*\/\n?/g, '');
  if (/play\.google\.com|web-only/.test(html)) throw new Error('web-only parts remain in the iOS build');
  fs.writeFileSync(file, html);
  console.log(`removed web-only parts for iOS (${before - html.length} bytes)`);
}
// iOS アプリの広告設定には、Android 用の広告 ID を同梱しない。App Store 用（本番）のビルドにはテスト用の ID も同梱しない
if (platform === 'ios') {
  const file = path.join(out, 'js', 'ads.js');
  let js = fs.readFileSync(file, 'utf8');
  js = js.replace(/[ \t]*\/\* android-only[\s\S]*?\/\* \/android-only \*\/\n?/g, '');
  if (process.env.ADMOB_MODE === 'production') js = js.replace(/[ \t]*\/\* test-units[\s\S]*?\/\* \/test-units \*\/\n?/g, '');
  if (/android-only|ca-app-pub-3940256099942544\/(1033173712|5224354917|9214589741)/.test(js)) throw new Error('Android ad units remain in the iOS build');
  if (process.env.ADMOB_MODE === 'production' && /ca-app-pub-3940256099942544/.test(js)) throw new Error('test ad units remain in the iOS App Store build');
  fs.writeFileSync(file, js);
}
// Google Play 用のビルドでは本番の広告を使う
const mode = process.env.ADMOB_MODE === 'production' ? 'production' : 'test';
fs.writeFileSync(path.join(out, 'js', 'ads-config.js'), `// ビルド時に生成\nwindow.AD_MODE = '${mode}';\n`);
// タイトル画面に出すバージョン（CI では VERSION_NAME / VERSION_CODE を使う）
const version = process.env.VERSION_CODE
  ? `v${process.env.VERSION_NAME || require('../package.json').version} (build ${process.env.VERSION_CODE})`
  : 'dev';
fs.writeFileSync(path.join(out, 'js', 'build-info.js'), `// ビルド時に生成\nwindow.APP_VERSION = '${version}';\n`);
console.log(`built web assets into www/ (ads: ${mode}, version: ${version})`);
