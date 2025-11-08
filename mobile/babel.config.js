// babel.config.js
module.exports = {
  presets: [
    [
      'module:metro-react-native-babel-preset',
      {
        loose: true, // QUAN TRỌNG: BẬT LOOSE CHO PRESET
      },
    ],
  ],
  plugins: [
    ['@babel/plugin-transform-private-methods', { loose: true }], // Đồng bộ

    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        alias: {
          '@modules': './src/modules',
          '@routes': './src/routes',
          '@services': './src/services',
          '@config': './src/config',
          '@assets': './src/assets',
          '@utils': './src/utils',
        },
      },
    ],
  ],
};