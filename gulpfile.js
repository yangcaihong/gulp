const { watch, series, parallel, src, dest } = require('gulp');
/**
 * 错误日志
 */
const gutil = require('gulp-util');
/**
 * 删除
 */
const del = require('del');
/**
 * 条件判断
 */
const gulpIf = require('gulp-if');
/**
 * js 转码
 */
const babel = require('gulp-babel');
/**
 * js 压缩
 */
const uglify = require('gulp-uglify');
/**
 * sass 编译
 */
const sass = require('gulp-sass');
/**
 * css前缀
 */
const autoprefixer = require('gulp-autoprefixer');
/**
 * css 压缩
 */
const minifyCss = require('gulp-clean-css');
/**
 * 添加前缀CDN
 */
const urlPrefixer = require('gulp-url-prefixer');
/**
 * 添加版本号
 */
const assetRev = require('gulp-asset-rev');
/**
 * html 压缩
 */
const htmlMin = require('gulp-htmlmin');
/**
 * 热加载
 */
const browserSync = require('browser-sync').create();

const config = {
	src: 'src', // 源代码目录
	dist: 'dist', // 编译后目录
	shouldUglify: false, // 是否需要压缩
	release: false, // 是否发布模式
	cdn: 'http://cdn.sydney710.cn/joke/'
};
/**
 * 清空文件
 */
const clean = () =>{
	return del([config.dist, config.src+'/css/*.css', '!'+config.src+'/css/base.css'], {
		force: true
	})
};
/**
 * sass 编译
 */
const scss = () => {
	return src(config.src+'/scss/*.scss')
	.pipe(sass())
	.pipe(dest(config.src+'/css'))
	.pipe(browserSync.reload({stream: true}))
};
/**
 * css处理
 * 添加前缀 & 添加版本号 & 添加cdn前缀 & 压缩
 */
const css = () => {
	return src(config.src+'/**/*.css')
	.pipe(autoprefixer())
	.pipe(gulpIf(config.release, assetRev()))
	.pipe(gulpIf(
		config.release,
		urlPrefixer.css({
			prefix: config.cdn
		})
	))
	.pipe(gulpIf(config.shouldUglify, minifyCss()))
	.pipe(dest(config.dist))
	.pipe(browserSync.reload({stream: true}))
};
/**
 * js 处理
 * es5转码 & 压缩
 */
function js(){
	return src(config.src+'/**/*.js')
	.pipe(babel({
		presets: ['@babel/env']
	}))
	.pipe(gulpIf(config.shouldUglify, uglify()))
	.pipe(dest(config.dist))
	.pipe(browserSync.reload({stream: true}))
}

/**
 * 图片处理
 */
const img = () => {
	return src(config.src+'/**/*.{jpg,png,jpeg,ico,bmp,svg}')
	//.pipe(gulpIf(config.release, imagemin()))
	.pipe(dest(config.dist))
	.pipe(browserSync.reload({stream: true}))
};

/**
 * html处理
 * 添加版本号 & 添加cdn前缀 & 压缩
 */
const html = () => {
	return src(config.src+'/*.html')
	.pipe(gulpIf(config.release, assetRev()))
	.pipe(gulpIf(config.release, urlPrefixer.html({
		prefix: config.cdn,
		tags: [
			'script',
			'link',
			'img',
		]
	})))
	.pipe(htmlMin({

	}))
	.pipe(dest(config.dist))
	.pipe(browserSync.reload({stream: true}))
};
/**
 * 除需要处理文件之外的文件直接复制
 */
const other = () => {
	try {
		return src([
			config.src + "/**/*",
			`!${config.src}/**/*.{html,scss,css,js,jpg,png,jpeg,icon,bmp,svg}`
		]).pipe(dest(config.dist))
		.pipe(browserSync.reload({stream: true}))
	} catch(err) {
		console.log("复制其它文件出错", err.message);
		return Promise.resolve(true);
	}

};
/**
 * 监听文件变化自动处理
 */
const watchFile = () => {
	watch(config.src + "/**/*.js", js);
	watch(config.src + "/**/*.scss", scss);
	watch(config.src + "/**/*.css", css);
	watch(config.src + "/**/*.{jpg,png,jpeg,ico,bmp,svg}", img);
	watch(config.src + "/**/*.html", html);
};

/**
 * 开发时使用
 */
const serve = () => {
	browserSync.init({
		files:['**'],
		server:{
			baseDir:'./live',  // 设置服务器的根目录
		},
		port:8050  // 指定访问服务器的端口号
	});
	watchFile();
};
exports.default = () => {
	config.dist = 'live';
	config.release = false;
	config.shouldUglify = false;
	series(clean, scss, parallel(css, js, img), html, other, serve)();
	return Promise.resolve(true)
};

exports.build = () => {
	config.release = true;
	config.shouldUglify = true;
	series(clean, scss, parallel(css, js, img), html, other)();
	return Promise.resolve(true)
};


