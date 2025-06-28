const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = {
  webpack: {
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "node_modules/cesium/Build/Cesium/Workers",
            to: "cesium/Workers",
          },
          {
            from: "node_modules/cesium/Build/Cesium/Assets",
            to: "cesium/Assets",
          },
          {
            from: "node_modules/cesium/Build/Cesium/Widgets",
            to: "cesium/Widgets",
          },
          {
            from: "node_modules/cesium/Build/Cesium/ThirdParty",
            to: "cesium/ThirdParty",
          },
        ],
      }),
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify("cesium"),
      }),
    ],
  },
};
