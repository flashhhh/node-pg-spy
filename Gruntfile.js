var src = 'src/**/*.js';
var srcParts = ['src/', '**/*.js'];

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  grunt.initConfig({
    babel: {
      options: {
        sourceMap: true,
        stage: 0
      },
      dist: {
        files: [{
          expand: true,
          cwd: srcParts[0],
          src: [srcParts[1]],
          dest: 'lib/',
          ext: '.js'
        }]
      }
    },
    watch: {
      js: {
        files: src,
        tasks: ['babel']
      }
    },
    mochaTest: {
      main: {
        src: ['test/**/*.js'],
        options: {
          quite: false,
          require: 'babel/register'
        }
      }
    },
    eslint: {
      target: [src]
    },
    jshint: {
      all: [src],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    jscs: {
      src: src,
      options: {
        config: '.jscsrc'
      }
    }
  });
  grunt.registerTask('lint', ['jscs', 'jshint', 'eslint']);
};
