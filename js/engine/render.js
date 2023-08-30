'use strict';

/*
**  ОБНОВЛЕНИЕ ЭКРАНА
*/

/**
 * @constant {Object} VIEW - Объект размеров игрового экрана
 * @param {number} VIEW.width - ширина игрового экрана (в пикселях)
 * @param {number} VIEW.height - высота игрового экрана (в пикселях)
 * @param {number} VIEW.x - x координата центра игрового экрана (округлена до целого числа)
 * @param {number} VIEW.y - y координата центра игрового экрана (округлена до целого числа)
 */
const VIEW = {
    width: innerWidth,
    height: innerHeight,
    x: Math.floor(innerWidth / 2),
    y: Math.floor(innerHeight / 2),
}

/**
 * @constant {Array<Objects>} VIEW_DEPENDS_OBJECTS_ARR - массив объектов, зависящих от размеров экрана
 * у каждого объекта в этом массиве при изменении размеров экрана вызывается метод object.resizingScreen()
 */
const VIEW_DEPENDS_OBJECTS_ARR = [];

// СОЗДАЁМ <CANVAS>
const canvas = document.createElement('canvas');
canvas.width = VIEW.width;
canvas.height = VIEW.height;

/**
 *  @constant {CanvasRenderingContext2D} CONTEXT - контекст для отрисовки графики в canvas
 */
const CONTEXT = canvas.getContext('2d');
CONTEXT.fillStyle = '#000000';
CONTEXT.fillRect(0, 0, VIEW.width, VIEW.height);

// ОТСЛЕЖИВАНИЕ ИЗМЕНЕНИЙ РАЗМЕРОВ ЭКРАНА
window.addEventListener('resize', () => {
    console.log('resize screen');
    VIEW.width = canvas.width = innerWidth;
    VIEW.height = canvas.height = innerHeight;
    VIEW.x = Math.floor(innerWidth / 2);
    VIEW.y = Math.floor(innerHeight / 2);
    VIEW_DEPENDS_OBJECTS_ARR.forEach( object => object.resizingScreen() );
});

/*
**  АНИМАЦИЯ
*/

// Готовность к запуску игрового процесса
let isGameReady = false;
function startGameRender() {
    document.body.prepend(canvas);
    isGameReady = true;
    startAnimation();
}

// Активно ли игровое окно (вкладка браузера)
let isOnFocus = false; 

// Временная метка запуска игрового цикла
let previousTimeStamp;

// Если окно не активно - остановить анимацию
window.onblur = stopAnimation;
// Если окно активно - запустить анимацию
window.onfocus = startAnimation;

// функция запуска анимации
// (если есть фоновая музыка - она запускается)
function startAnimation() {
    if (!isGameReady) return;

    console.log('start animation');
    isOnFocus = true;
    if (BG_MUSIC.src) BG_MUSIC.play();
    previousTimeStamp = performance.now();
    requestAnimationFrame( animation );
}

// функция остановки анимации
// (фоновая музыка ставится на паузу)
function stopAnimation() {
    console.log('stop animation');
    isOnFocus = false;
    if (BG_MUSIC.src) BG_MUSIC.pause();
}

// функция анимации
// (принимает количество миллисекунд с момента запуска программы)
function animation(timeStamp) {
    // расчет интервала между обновлениями экрана
    const dt = timeStamp - previousTimeStamp;
    previousTimeStamp = timeStamp;
    if (dt > 19) console.warn('Low FPS!', (1000 / dt).toFixed(2));

    // очистка <canvas>
    CONTEXT.clearRect(0, 0, VIEW.width, VIEW.height);

    // вызов функции игрового цикла из файла game.js
    // (dt - время интервала между обновлениями экрана)
    gameLoop(dt);

    // отмена событий вращения колеса мыши
    if (IS_MOBILE === false) {
        CURSOR.isWheelUp = false;
        CURSOR.isWheelDown = false;
    }

    // повторный запуск анимации, если окно активно
    if (isOnFocus) requestAnimationFrame( animation );
}