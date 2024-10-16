# Raindrop CAD/CAM
<img src="https://raw.githubusercontent.com/nyarurato/Raindrop_CAM/refs/heads/master/public/img/logo-512.png" width="50%"/>

回転軸を有する3軸,4軸CNCマシン用のWebベースの2D CAD/CAMです。  
Webブラウザ上で棒材の半径の断面図形を設定し、加工用のNCファイル（Gコード）を生成することができます。  
ブラウザ上ですべての処理が完結するため、図形や加工ファイルは外部に送信されることはありません。  

現在は以下の軸構成のみ対応しています。  
|軸方向|マシン軸名|
|---|---|
|材料半径方向|Z軸|
|材料長さ方向|Y軸|
|材料回転軸|B軸|

また、断面図形は直線のみサポートしています。

## Webページ
https://nyarurato.github.io/Raindrop_CAM/

## 操作概略
![操作画面](https://github.com/user-attachments/assets/b769c5ef-40ef-44da-9ab0-fed904d121b8)

## 既知の問題(v0.1.0)
- 現在、加工パス生成は単純半径オフセットのみのサポートのため、すべての形状において正しく加工はできません。  
ワークの表面の曲率がエンドミルの曲率より大きい場合、削りすぎが発生します。
- シミュレーションは簡易的にエンドミルを立方体としているため、削りすぎが発生しています。

## Development
### Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run dev
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

