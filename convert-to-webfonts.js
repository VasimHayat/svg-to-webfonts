const fs = require('fs');
const SVGIcons2SVGFontStream = require('svgicons2svgfont');
const svg2ttf = require('svg2ttf');
const ttf2eot = require('ttf2eot');
const ttf2woff = require('ttf2woff');
const ttf2woff2 = require('ttf2woff2');
let basePath = '';

fs.readFile('svg.metadata.json', 'utf-8', (err, data) => {
    if (err) throw err

    const res = JSON.parse(data);
    basePath = res.fontDestination + '/' + res.fontName;
    convertSvgToSvgFont(res);
});

function convertSvgToSvgFont(res) {
    const fontStream = new SVGIcons2SVGFontStream({
        fontName: res.fontName,
        normalize: true
    });


    const svgFontPath = basePath + '.svg';
    fontStream.pipe(fs.createWriteStream(svgFontPath))
        .on('finish', function () {
            console.log('Font successfully created!');
            convertToWebFonts();
        })
        .on('error', function (err) {
            console.log(err);
        });

    res.fontClasses.forEach(function (fontClass) {
        const glyph = fs.createReadStream(fontClass.path);
        glyph.metadata = {
            unicode: [fontClass.unicode],
            name: fontClass.name
        };
        fontStream.write(glyph);
    });

    fontStream.end();
}

function convertToWebFonts() {

    const svgFontPath = basePath + '.svg';
    const ttfFontPath = basePath + '.ttf';
    const eotFontPath = basePath + '.eot';
    const woffFontPath = basePath + '.woff';
    const woff2FontPath = basePath + '.woff2';

    try {
        const ttf = svg2ttf(fs.readFileSync(svgFontPath, 'utf8'), {});
        fs.writeFileSync(ttfFontPath, new Buffer.from(ttf.buffer));

        const eot = new Buffer.from(ttf2eot(ttf).buffer);
        fs.writeFileSync(eotFontPath, eot);

        const woff = new Buffer.from(ttf2woff(ttf).buffer);
        fs.writeFileSync(woffFontPath, woff);

        const woff2 = new Buffer.from(ttf2woff2(ttf).buffer);
        fs.writeFileSync(woff2FontPath, woff2);
    } catch (err) {
        console.log('some thing went wrong');
        console.log(err);
    }

}