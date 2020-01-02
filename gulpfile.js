'use strict';

const MoveJavaScriptTask = "js";
const MoveHtmlTask = "html";
const MoveSassTask = "sass";
const serveTask = "serve";

const htmlSource = "src/*.html";
const javaScriptSource = "src/js/*.js";
const scssSource = "src/scss/*.scss";

var gulp = require("gulp");
var browserSync = require("browser-sync").create();
var sass = require("gulp-sass");
var d3 = require("d3")

gulp.task(MoveSassTask, function() {
  return gulp
    .src([
      "node_modules/bootstrap/scss/bootstrap.scss", 
      scssSource])
    .pipe(sass())
    .pipe(gulp.dest("build/css"))
    .pipe(browserSync.stream());
});

gulp.task(MoveJavaScriptTask, function() {
  return gulp
    .src([
      "node_modules/bootstrap/dist/js/bootstrap.min.js",
      "node_modules/jquery/dist/jquery.min.js",
      "node_modules/popper.js/dist/umd/popper.min.js",
      "node_modules/d3/dist/d3.min.js",
      javaScriptSource
    ])
    .pipe(gulp.dest("build/js/"))
    .pipe(browserSync.stream());
});

gulp.task(MoveHtmlTask, function() {
  return gulp
    .src([htmlSource])
    .pipe(gulp.dest("build"))
    .pipe(browserSync.stream());
});

gulp.task(
  serveTask,
  gulp.series(
    [MoveSassTask], function() {
    browserSync.init({
      server: "./build"
    });

    gulp.watch([scssSource], gulp.series([MoveSassTask]));
    gulp.watch([javaScriptSource], gulp.series([MoveJavaScriptTask]));
    gulp.watch([htmlSource], gulp.series([MoveHtmlTask]));

    gulp.watch([scssSource, javaScriptSource, htmlSource])
      .on("change", browserSync.reload);
  })
);

gulp.task("default", gulp.series([MoveJavaScriptTask, MoveHtmlTask, serveTask]));