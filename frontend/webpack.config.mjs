import path from 'path';
import { fileURLToPath } from 'url';
import Dotenv from 'dotenv-webpack';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'static/js/bundle.[contenthash].js',
        publicPath: '/',
    },
    mode: 'production',
    devServer: {
        static: path.join(__dirname, 'build'),
        port: 3000,
        historyApiFallback: true,
        hot: true,
        proxy: [
            {
                context: ['/api'],
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false
            }
        ]
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,  // ✅ Aggiungi supporto per immagini e font
                type: 'asset/resource',
                generator: {
                    filename: 'static/media/[hash][ext][query]',  // ✅ Salva in build/static/media/
                },
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html',
        }),
        new Dotenv()
    ]
};
