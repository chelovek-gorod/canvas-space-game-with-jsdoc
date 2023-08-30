'use strict';

/*
**  ИГРОВЫЕ ФУНКЦИИ
*/

/**
 * @constant {number} 2*Math.PI - 2Пи (360 градусов в радианах)
 */
const _2PI = Math.PI * 2;

/**
 * @constant {number} Math.PI/180 - 1 градус в радианах (Константы для работы с радианами)
 * @example пример перевода 180 градусов в радианы: let angleInRadians = 180 * _RAD;
 */
const _RAD = Math.PI / 180;

/**
 * Функция возвращает случайное дробное число между min и max
 * @param {number} min - минимальное число (включительно)
 * @param {number} max - Максимальное число (не включая)
 * @return {number} случайное дробное число между min и max
 */
function getRandomFloatFromRange(min, max) {
    return min + Math.random() * (max - min);
}

/**
 * Функция определяющая находится ли объект object в видимой части экрана
 * @param {Object} object - объект (обязательные поля: object.x; object.y, object.imageAngle, object.halfWidth, object.halfHeight)
 * @return {boolean} возвращает true, если объект object находится в видимой части экрана
 */
function checkObjectVisibility(object) {
    if (object.imageAngle === 0) {
        if(object.x + object.halfWidth < 0) return false;
        if(object.y + object.halfHeight < 0) return false;
        if(object.x - object.halfWidth > VIEW.width) return false;
        if(object.y - object.halfHeight > VIEW.height) return false;
        return true;
    } else {
        const diagonal =  Math.sqrt(object.halfWidth * object.halfWidth + object.halfHeight * object.halfHeight);
        if(object.x + diagonal < 0) return false;
        if(object.y + diagonal < 0) return false;
        if(object.x - diagonal > VIEW.width) return false;
        if(object.y - diagonal > VIEW.height) return false;
        return true;
    }
}

/**
 * Функция определения расстояния в пикселях между объектами object и target
 * @param {Objects} object - объект (обязательные поля: object.x; object.y)
 * @param {Objects} target - объект (обязательные поля: target.x; target.y)
 * @return {number} возвращает число пикселей между объектами object и target
 */
 function getDistance(object, target) {
    let dx = target.x - object.x;
    let dy = target.y - object.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * функция перемещения объекта object согласно его направления direction на расстояние pathSize
 * @param {Object} object - перемещаемый объект (обязательные поля: object.x; object.y; object.direction)
 * @param {number} pathSize - число пикселей для перемещения
 */
 function moveObject(object, pathSize) {
    object.x += Math.cos(object.direction) * pathSize;
    object.y += Math.sin(object.direction) * pathSize;
}

/**
 * Функция поворота объекта object к объекту target, на угол turnAngle
 * @param {Objects} object - поворачиваемый объект (обязательные поля: object.x; object.y; object.imageAngle; object.direction)
 * @param {Objects} target - объект, к которому поворачиваемся (обязательные поля: target.x; target.y)
 * @param {number} turnAngle - угол поворота (в радианах), на который будут изменены direction (и imageAngle)
 * @param {boolean} isImageAngleEqualDirection - Нежно ли так же повернуть изображение (по умолчанию = true)
 */
function turnObjectToTarget(object, target, turnAngle, isImageAngleEqualDirection = true) {
    let pointDirection = Math.atan2(target.y - object.y, target.x - object.x);
    let deflection = (pointDirection - object.direction) % _2PI;
    if (!deflection) return;

    if (deflection < -Math.PI) deflection += _2PI;
    if (deflection >  Math.PI) deflection -= _2PI;

    if (Math.abs(deflection) <= turnAngle) object.direction = pointDirection;
    else object.direction += (deflection <  0) ? -turnAngle : turnAngle;
    if(isImageAngleEqualDirection) object.imageAngle = object.direction;
}

/**
 * Функция перемещения объекта object к объекту target на pathSize пикселей (без поворотов)
 * @param {Objects} object - перемещаемый объект (обязательные поля: object.x; object.y)
 * @param {Objects} target - объект к которому перемещаемся (обязательные поля: target.x; target.y)
 * @param {number} pathSize - число пикселей для перемещения
 */
function moveObjectToTarget(object, target, pathSize) {
    if (object.x === target.x && object.y === target.y) return;
    
    let dx = target.x - object.x;
    let dy = target.y - object.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= pathSize) {
        object.x = target.x;
        object.y = target.y;
    } else {
        let moveRate = pathSize / distance;
        object.x += moveRate * dx;
        object.y += moveRate * dy;
    }
}

/**
 * Функция отрисовки электрического разряда между объектами object и target цветом color
 * @param {Objects} object - объект, от которого начинается отрисовка (обязательные поля: object.x; object.y)
 * @param {Objects} target - объект, к которому ведется отрисовка (обязательные поля: target.x; target.y)
 * @param {string} color - цвет электрического разряда (по умолчанию "#ffe0ff" или "#e0ffff" или "#ffffe0")
 */
function drawLightning(object, target, color=null) {
    const colorsArr = ["#ffe0ff", "#e0ffff", "#ffffe0"];
    const lineColor = color ? color : colorsArr[Math.floor(Math.random() * colorsArr.length)];

    const distance = getDistance(object, target);
    const stepsCount = Math.ceil((distance / 4) + Math.random() * (distance / 8));
    const offsetRate = 6;

    const detDistance4Points = (x1, y1, x2, y2) => {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    let xx = object.x;
    let yy = object.y;

    CONTEXT.save();
    CONTEXT.lineWidth = 2;
    CONTEXT.strokeStyle = lineColor;
    CONTEXT.shadowBlur  = 6;
    CONTEXT.shadowColor = lineColor;
    CONTEXT.globalCompositeOperation = 'lighter';
    CONTEXT.beginPath();
    CONTEXT.moveTo(xx, yy);
    for (let i = stepsCount; i > 1; i--) {
        let pathLength = detDistance4Points(xx, yy, target.x, target.y);
        let offset = Math.sin(pathLength / distance * Math.PI) * offsetRate;
        xx += (target.x - xx) / i + Math.random() * offset * 2 - offset;
        yy += (target.y - yy) / i + Math.random() * offset * 2 - offset;
        CONTEXT.lineTo(xx, yy);
    }
    CONTEXT.stroke();
    CONTEXT.restore();
}