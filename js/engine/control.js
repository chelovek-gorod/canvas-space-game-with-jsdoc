'use strict';

/*
**  ОПРЕДЕЛЕНИЕ УСТРОЙСТВА
*/

/**
 *  @constant {boolean} IS_MOBILE - если true то используется тачскрин, иначе - мышь и клавиатура
 */
// ОПРЕДЕЛЯЕМ ТИП УСТРОЙСТВА ПОЛЬЗОВАТЕЛЯ
const IS_MOBILE = function() {
    if (navigator.userAgent.indexOf('Android') > 0) return true;
    if (navigator.userAgent.indexOf('iPhone') > 0) return true;
    if (navigator.userAgent.indexOf('iPad') > 0) return true;
    if (navigator.userAgent.indexOf('(X11;') > 0) return true;
    return false;
}();

/*
**  КУРСОР
*/

/**
 * Объект курсора (мышь или касания, в зависимости от устройства)
 * @param {number} CURSOR.x x - координата курсора мыши или касания на экране
 * @param {number} CURSOR.y y - координата курсора мыши или касания на экране
 * @param {boolean} CURSOR.isClicked - есть ли нажатие на левую кнопку мыши или касание экрана
 * @param {boolean} CURSOR.isContextClicked - (только для мыши) есть ли нажатие на правую кнопку мыши
 * @param {boolean} CURSOR.isWheelClicked - (только для мыши) есть ли нажатие на колесо мыши
 * @param {boolean} CURSOR.isWheelUp - (только для мыши) прокручено ли колесо вверх (отменяются в файле render.js)
 * @param {boolean} CURSOR.isWheelDown - (только для мыши) прокручено ли колесо вниз (отменяются в файле render.js)
 * @example пример применения: if(CURSOR.isClicked && CURSOR.x < 100 && CURSOR.y >= 0 ) myFunction()
 */
const CURSOR = {
    x: 0,
    y: 0,
    isClicked: false,

    isContextClicked: false,
    isWheelClicked: false,
    isWheelUp: false,
    isWheelDown: false,
}

if (IS_MOBILE) {
    /*
    **  ТАЧПАД
    */

    // обработка начала касания экрана (для мобильных устройств)
    document.addEventListener('touchstart', function(event) {
        const touch = event.touches[0];
        CURSOR.x = touch.pageX;
        CURSOR.y = touch.pageY;
        CURSOR.isClicked = true;
    });

    // обработка движения пальца при касании экрана (для мобильных устройств)
    document.addEventListener('touchmove', function(event) {
        const touch = event.touches[0];
        CURSOR.x = touch.pageX;
        CURSOR.y = touch.pageY;
    });

    // обработка окончания касания экрана (для мобильных устройств)
    document.addEventListener('touchend', function(event) {
        CURSOR.isClicked = false;
    });
} else {
    /*
    **  МЫШЬ
    */

    // обработка перемещения мыши
    document.onmousemove = (event) => {
        CURSOR.x = event.pageX;
        CURSOR.y = event.pageY;
    };

    // отмена вызова контекстного меню при правом клике мыши
    document.oncontextmenu = (event) => event.preventDefault();

    // обработка нажатий клавиш мыши
    document.onmousedown = (event) => {
        switch(event.button) {
            case 0 : CURSOR.isClicked = true; break;
            case 1 : CURSOR.isWheelClicked = true; break;
            case 2 : CURSOR.isContextClicked = true; break;
        }
    }

    // обработка отпускания клавиш мыши
    document.onmouseup = (event) => {
        switch(event.button) {
            case 0 : CURSOR.isClicked  = false; break;
            case 1 : CURSOR.isWheelClicked = false; break;
            case 2 : CURSOR.isContextClicked = false; break;
        }
    }

    // обработка прокрутки колеса мыши (отменяются по окончанию обновления экрана в файле render.js)
    document.onwheel = (event) => {
        // event.preventDefault();
        if (event.deltaY > 0) CURSOR.isWheelDown = true;
        if (event.deltaY < 0) CURSOR.isWheelUp = true;
    };
}

/*
**  КЛАВИАТУРА
*/

/**
 * Объект состояния клавиш клавиатуры
 * @param {boolean} KEY.isKeyNamePressed нажата ли указанная клавиша
 * @example пример применения: if(KEY.up && KEY.shift) myFunction()
 */
const KEY = {
    up : false,
    down : false,
    left : false,
    right : false,

    space : false,
    ctrl : false,
    alt : false,
    shift : false,
    // при необходимости можете дописать дополнительные клавиши
};

if (!IS_MOBILE) {
    // обработка нажатий клавиш клавиатуры
    document.addEventListener('keydown', (event) => {
        switch(event.code) {
            case 'KeyA' : KEY.left = true; break;
            case 'KeyD' : KEY.right = true; break;
            case 'KeyW' : KEY.up = true; break;
            case 'KeyS' : KEY.down = true; break;
        
            case 'ArrowLeft' : KEY.left = true; break;
            case 'ArrowRight' : KEY.right = true; break;
            case 'ArrowUp' : KEY.up = true; break;
            case 'ArrowDown' : KEY.down = true; break;

            case 'Space' : KEY.space = true; break;

            case 'ControlLeft' : KEY.ctrl = true; break;
            case 'ControlRight' : KEY.ctrl = true; break;

            case 'AltLeft' : KEY.alt = true; break;
            case 'AltRight' : KEY.alt = true; break;

            case 'ShiftLeft' : KEY.shift = true; break;
            case 'ShiftRight' : KEY.shift = true; break;

            // при необходимости можете дописать дополнительные обработчики
            // пример вывода в консоль кода клавиш описан ниже в событии 'keyup'
        }
    });

    // обработка отпускания клавиш клавиатуры
    document.addEventListener('keyup', (event) => {
        switch(event.code) {
            case 'KeyA' : KEY.left = false; break;
            case 'KeyD' : KEY.right = false; break;
            case 'KeyW' : KEY.up = false; break;
            case 'KeyS' : KEY.down = false; break;
        
            case 'ArrowLeft' : KEY.left = false; break;
            case 'ArrowRight' : KEY.right = false; break;
            case 'ArrowUp' : KEY.up = false; break;
            case 'ArrowDown' : KEY.down = false; break;

            case 'Space' : KEY.space = false; break;

            case 'ControlLeft' : KEY.ctrl = false; break;
            case 'ControlRight' : KEY.ctrl = false; break;

            case 'AltLeft' : KEY.alt = false; break;
            case 'AltRight' : KEY.alt = false; break;

            case 'ShiftLeft' : KEY.shift = false; break;
            case 'ShiftRight' : KEY.shift = false; break;
        }
        // можно просмотреть event.code для кнопок
        // и при необходимости выше дописать их обработку
        console.log('key code :', event.code);
    });
}