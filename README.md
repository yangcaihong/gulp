修改版本号为？v=

找到文件：/node_modules/gulp-asset-rev/index.js

修改78~80行：
var verStr = (options.verConnecter || "-") + md5;
src = src.replace(verStr, '').replace(/(\.[^\.]+)$/, verStr + "$1");

改为：
var verStr = (options.verConnecter || "") + md5;
src = src + "?v=" + verStr;
