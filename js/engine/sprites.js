'use strict';

/*
**  ИГРОВЫЕ КЛАССЫ
*/

/** Класс текстовых объектов */
class TextSprite {
    /**
     * Создание текстового объекта
     * @param {string?} text - текст (по умолчанию пустая строка)
     * @param {number?} x - координата x отображения текста
     * @param {number?} y - координата y отображения текста
     * @param {Object?} options - объект настройки текста
     * @param {string} options.weight - начертание текста ('normal', 'bold', '300')
     * @param {string} options.style - стиль текста ('normal' или 'italic')
     * @param {number} options.size - размер текста в пикселях (по умолчанию 24)
     * @param {string} options.family - семейство шрифтов (по умолчанию 'Arial')
     * @param {string} options.color - цвет текста (по умолчанию '#00ff00')
     * @param {string} options.strokeColor - цвет обводки текста (по умолчанию '#00000000')
     * @param {number} options.strokeWidth - размер обводки текста в пикселях (по умолчанию 0)
     * @param {string} options.align - расположение текста ('left', 'center', 'right')
     * @example пример создания текстового объекта: let text = new Text('Hi', 10, 100, {color: '#ff0000', size: 32});
     */
    constructor(text = '', x = 0, y = 0, options ) {
        this.x = x;
        this.y = y;
        this.weight = options.weight || 'normal';
        this.style = options.style || 'normal';
        this.size = options.size || 24;
        this.family = options.font || 'Arial';
        this.color = options.color || '#00ff00';
        this.strokeColor = options.strokeColor || '#00000000';
        this.strokeWidth = options.strokeWidth || 0;
        this.align = options.align ? this.getTextAlign( options.align ) : 'left';
        this.offsetX = 0;
        this.font = `${this.weight} ${this.style} ${this.size}px ${this.font}, Arial, sans-serif`;
        this.img = document.createElement('canvas');
        this.ctx = this.img.getContext('2d');
        this.img.width = this.getTextWidth(text);
        this.img.height = this.size;
        this.isExist = true;

        this.render(text);
    }

    // определение расположения текста
    getTextAlign(align) {
        switch(align) {
            case 'right': return 'right';
            case 'center':  return 'center';
            default : return 'left';
        }
    }

    // определение ширины canvas для отрисовки текста
    getTextWidth(text) {
        this.ctx.font = this.font;
        return this.ctx.measureText(text || ' ').width;
    }

    /**
     * Обновление текста
     * @param {string} text - новый текст
     */
    render(text) {
        this.ctx.clearRect(0, 0, this.img.width, this.img.height);

        this.img.width =  this.getTextWidth(text);

        if (this.align === 'right') {
            this.offsetX = this.img.width;
        }
        if (this.align === 'center') {
            this.offsetX = Math.floor(this.img.width / 2);
        }

        this.ctx.font = this.font;
        this.ctx.textBaseline = 'top';
        this.ctx.textAlign = this.align;
        this.ctx.fillStyle = this.color;
        this.ctx.fillText(text || ' ', this.offsetX, 0);
        if (this.strokeWidth) {
            this.ctx.strokeStyle = this.strokeColor;
            this.ctx.lineWidth = this.strokeWidth;
            this.ctx.strokeText(text || ' ', this.offsetX, 0);
        }
    }

    /**
     * Отрисовка текста
     */
    draw() {
        CONTEXT.drawImage( this.img, this.x - this.offsetX, this.y);
    }
}

/** Класс статичных спрайтов */
class Sprite {
    /**
     * Создание статичного спрайта
     * @param {string} imageName - имя файла с изображением
     * @param {number} x - координата x центра спрайта
     * @param {number} y - координата y центра спрайта
     * @param {number?} imageAngle - угол поворота спрайта (в радианах, по умолчанию = 0)
     * @example пример создания спрайта: let player = new Sprite('player.png', VIEW.x, VIEW.y);
     */
    constructor(imageName, x, y, imageAngle = 0) {
        this.img = IMG[imageName];
        this.x = x;
        this.y = y;
        this.width= this.img.width;
        this.height = this.img.height;
        this.halfWidth = Math.floor(this.width / 2);
        this.halfHeight = Math.floor(this.height / 2);
        this.imageAngle = imageAngle;
        this.direction = imageAngle;
        this.size = this.halfWidth > this.halfHeight ? this.halfHeight : this.halfWidth;
        this.isExist = true;
    }

    /**
     * отрисовка спрайта
     */
    draw() {
        if (this.imageAngle === 0) CONTEXT.drawImage( this.img, this.x - this.halfWidth,  this.y - this.halfHeight);
        else {
            CONTEXT.setTransform(1, 0, 0, 1, this.x, this.y);
            CONTEXT.rotate(this.imageAngle);
            CONTEXT.drawImage(this.img, -this.halfWidth, -this.halfHeight);
            CONTEXT.setTransform(1, 0, 0, 1, 0, 0);
        }
    }
}

/** Класс анимированных спрайтов (набора кадров) */
class SpriteSheet {
    /**
     * Создание анимированного спрайта
     * @param {string} imageName - имя файла с изображением (набора кадров)
     * @param {number} x - координата x центра спрайта
     * @param {number} y - координата y центра спрайта
     * @param {number} frameWidth - ширина одного кадра в пикселях
     * @param {number} frameHeight - высота одного кадра в пикселях
     * @param {number} frames - количество кадров на изображении
     * @param {number?} fps - частота смены кадров в секунду при анимации (по умолчанию: 60)
     * @param {number?} imageAngle - угол поворота спрайта (в радианах, по умолчанию = 0)
     * @example пример создания анимированного спрайта: let fire = new Text('fire.png', VIEW.x, VIEW.y, 64, 96, 12, 60);
     */
    constructor(imageName, x, y, frameWidth, frameHeight, frames, fps = 60, imageAngle = 0) {
        this.img = IMG[imageName];
        this.x = x;
        this.y = y;
        this.width = frameWidth;
        this.height = frameHeight;
        this.halfWidth = Math.floor(this.width / 2);
        this.halfHeight = Math.floor(this.height / 2);
        this.imageAngle = imageAngle;
        this.direction = imageAngle;
        this.size = this.halfWidth > this.halfHeight ? this.halfHeight : this.halfWidth;
        this.isExist = true;

        this.framesArr = this.getFramesArr(frameWidth, frameHeight, frames);
        this.frame = 0
        this.frames = frames;
        this.nextFrameTimeout = Math.floor(1000 / fps);
        this.nextFrameTime = this.nextFrameTimeout;
    }

    // получение массива координат кадров изображения
    getFramesArr(frameWidth, frameHeight, frames) {
        const framesArr = [];
        for( let yy = 0; yy < this.img.height; yy += frameHeight) {
            for( let xx = 0; xx < this.img.width; xx += frameWidth) {
                framesArr.push( {x: xx, y: yy} );
            }
        }
        framesArr.length = frames;
        return framesArr;
    }

    /**
     * Отрисовка кадров с учетом скорости анимации
     * @param {number} dt - время в миллисекундах между обновлениями экрана
     */
    drawWithAnimation(dt) {
        this.nextFrameTime -= dt;
        if (this.nextFrameTime < 0) {
            this.nextFrameTime += this.nextFrameTimeout;
            this.frame++;
            if (this.frame === this.frames) this.frame = 0;
        }

        if (this.imageAngle === 0) this.draw();
        else {
            CONTEXT.setTransform(1, 0, 0, 1, this.x, this.y);
            CONTEXT.rotate(this.imageAngle);
            this.draw(-this.halfWidth, -this.halfHeight);
            CONTEXT.setTransform(1, 0, 0, 1, 0, 0);
        }
    }

    /**
     * Отрисовка текущего кадра (без проигрывания анимации)
     * (параметры передавать не нужно!!!)
     */
    draw(pointX = this.x - this.halfWidth, pointY = this.y - this.halfHeight) {
        CONTEXT.drawImage(
            this.img,
            this.framesArr[this.frame].x, this.framesArr[this.frame].y, 
            this.width, this.height,
            pointX, pointY,
            this.width, this.height
        );
    }
}

/**
 * Класс тайловых спрайтов
 * @extends Sprite
 */
class TileSprite extends Sprite {
    /**
     * Создание тайлового спрайта (как текстуры или набор плиток)
     * @param {string} tileName - имя файла с изображением тайла
     * @param {number} x - координата x центра итогового изображения
     * @param {number} y - координата y центра итогового изображения
     * @param {number} width - ширина итогового изображения в пикселях
     * @param {number} height - высота итогового изображения в пикселях
     * @param {string} horizontalAlign - горизонтальное выравнивание ('left', 'center', 'right')
     * @param {string} verticalAlign - вертикальное выравнивание  ('top', 'center', 'bottom')
     * @example пример создания текстового объекта: let background = new TileSprite('tile_32x32px.jpg', 0, 0, 128, 64, 'left', 'top');
     */
    constructor(tileName, x, y, width, height, horizontalAlign = 'left', verticalAlign = 'top') {
        super(createTileImage(tileName, width, height, horizontalAlign, verticalAlign), x, y);
        this.tileName = tileName;
    }
}

// Функция генерации тайлового изображения (используется в конструкторе класса TileSprite)
function createTileImage(tileName, width, height, horizontalAlign, verticalAlign) {
    const tile = IMG[tileName];
    let offsetX = 0;
    let offsetY = 0;
    if (horizontalAlign === 'center') {
        if (width > tile.width) offsetX = -Math.floor( (tile.width - (width % tile.width)) / 2 );
        if (width < tile.width) offsetX = -Math.floor( (tile.width - width) / 2 );
    }
    else if (horizontalAlign === 'right') {
        if (width > tile.width) offsetX = -(tile.width - (width % tile.width));
        if (width < tile.width) offsetX = -(tile.width - width);
    }
    else horizontalAlign = 'left';

    if (verticalAlign === 'center') {
        if (height > tile.height) offsetY = -Math.floor( (tile.height - (height % tile.height)) / 2 );
        if (height < tile.height) offsetY = -Math.floor( (tile.height - height) / 2 );
    }
    else if (verticalAlign === 'bottom') {
        if (height > tile.height) offsetY = -(tile.height - (height % tile.height));
        if (height < tile.height) offsetY = -(tile.height - height);
    }
    else verticalAlign = 'top';

    const img = document.createElement('canvas');
    img.width = width;
    img.height = height;
    const imgContext = img.getContext('2d');

    for( let yy = offsetY; yy < height; yy += tile.height) {
        for( let xx = offsetX; xx < width; xx += tile.width) {
            imgContext.drawImage(tile, xx, yy);
        }
    }

    img.imageName = `tile_${width}x${height}px_${horizontalAlign}_${verticalAlign}_from_${tileName}`;
    IMG[img.imageName] = img;
    return img.imageName;
}