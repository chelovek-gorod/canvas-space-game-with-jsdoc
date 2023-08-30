'use strict';

/*
**  ЗАГРУЗКА ИГРОВЫХ РЕСУРСОВ
*/

/**
 * Объект для хранения загруженных изображений IMG = {'image.png': Image}
 * @example пример получения загруженного изображения по имени файла с изображением:
 * sprite = IMG["image.png"]
 */
const IMG = {/* game images */};

/**
 * Объект для хранения загруженных звуков SE = {'sound.mp3': Audio}
 * @example пример получения загруженного звука по имени аудио файла:
 * sound = SE["sound.mp3"]
 */
const SE = {/* sound effects */};

// список загружаемых скриптов
const scriptsToUploadArray = [
    './js/engine/control.js',
    './js/engine/music.js',
    './js/engine/utils.js',
    './js/engine/sprites.js',
    './js/engine/render.js',
];

// упорядоченный список загружаемых скриптов (game.js должен загружаться самым последним)
// загрузка запускается в указанном порядке и после загрузки скриптов из массива scriptsToUploadArray
// так как в данных скриптах используются переменные, функции и классы из ранее загруженных скриптов
const orderedScriptsToUploadArray = [
    './js/objects.js',
    './js/game.js',
];

// счетчик количества загруженных игровых ресурсов
let uploadSize = soundsToUploadArray.length + imagesToUploadArray.length + scriptsToUploadArray.length;
let uploadStep = 0;

// отображения состояния загрузки игровых ресурсов
const loadingStatusDiv = document.createElement('div');
loadingStatusDiv.id = 'loadingStatusDiv';
loadingStatusDiv.innerHTML = loadingText + ' ' + uploadStep + '/' + uploadSize;
document.body.append(loadingStatusDiv);

// загрузка игровых ресурсов
imagesToUploadArray.forEach( data => uploadImage(data) );
soundsToUploadArray.forEach( data => uploadSound(data) );
scriptsToUploadArray.forEach( data => uploadScript(data) );

// функция загрузки изображений
function uploadImage(image_name) {
    IMG[image_name] = new Image();
    IMG[image_name].src = IMAGES_PATH + image_name;
    IMG[image_name].onload = () => updateLoadingProgress();
}

// функция загрузки звуков
function uploadSound(sound_name) {
    SE[sound_name] = new Audio();
    SE[sound_name].src = SOUNDS_PATH + sound_name;
    SE[sound_name].oncanplaythrough = (event) => {
        event.target.oncanplaythrough = null; // не запускать звук после его загрузки
        updateLoadingProgress();
    };
}

// функция загрузки скриптов
function uploadScript(script_name) {
    const script = document.createElement('script');
    script.src = script_name;
    document.body.append(script);
    script.onload = () => updateLoadingProgress();
}

// функция обновления отображаемого состояния загрузки игровых ресурсов
function updateLoadingProgress() {
    uploadStep++;
    loadingStatusDiv.innerHTML = loadingText + ' ' + uploadStep + '/' + uploadSize;
    if (uploadStep === uploadSize) loadingDone();
}

// функция окончания загрузки всех игровых ресурсов
function loadingDone() {
    loadingStatusDiv.remove();
    const startButton = document.createElement('button');
    startButton.id = 'startButton';
    startButton.innerHTML = startButtonText;
    startButton.onclick = function() {
        startButton.remove();
        orderedUploadScripts(orderedScriptsToUploadArray);
    };
    document.body.append(startButton);
}

// функция упорядоченной загрузки скриптов
function orderedUploadScripts(scripts) {
    const script = document.createElement('script');
    script.src = scripts[0];
    document.body.append(script);
    if (scripts.length > 1) script.onload = () => orderedUploadScripts(scripts.slice(1));
}