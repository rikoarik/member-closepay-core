const path = require('path');

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@core': path.resolve(__dirname, 'packages/core'),
          '@plugins': path.resolve(__dirname, 'packages/plugins'),
          '@app': path.resolve(__dirname, 'src'),
        },
        extensions: [
          '.js',
          '.jsx',
          '.ts',
          '.tsx',
          '.json',
        ],
      },
    ],
  ],
};
