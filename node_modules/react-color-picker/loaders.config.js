module.exports = [
    {
        test: /\.jsx$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
    },
    {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
    },
    {
        test: /\.styl$/,
        exclude: /node_modules/,
        loader: 'style-loader!css-loader!autoprefixer!stylus-loader'
    },
    {
        test: /\.css$/,
        loader: 'style-loader!css-loader!autoprefixer'
    },
    {
        test: /\.png$/,
        loader: 'url-loader?mimetype=image/png'
    }
]