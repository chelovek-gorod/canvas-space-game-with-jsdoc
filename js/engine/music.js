'use strict';

/*
**  ФОНОВАЯ МУЗЫКА
**  звуковые эффекты
*/

/**
 * @constant {number} Объект плеера фоновой музыки
 * @example пример установка громкости фоновой музыки (от 0 до 1): BG_MUSIC.volume = 0.5 - 
 */
const BG_MUSIC = new Audio();

// индекс фоновой музыки для воспроизведения
let bgMusicIndex = 0;
let bgMusicArray = [];

/**
 * Запуск фоновой музыки из переданного массива
 * по окончанию музыки запускается следующий трек из переданного ранее массива
 * @param  {Array.<string>} musicArray - массив с иминами звуковых файлов для воспроизведения
 * @param  {number?} index - (не обязательный, по умолчанию 0) порядковый номер имени файла,
 * с которого нужно начать воспроизведение
 * @example пример применения: playBgMusic(['bgm1.mp3', 'bgm2.mp3'], 1)
 */
function playBgMusic(musicArray, index = 0) {
    if (Array.isArray(musicArray)) {
        bgMusicArray = musicArray;
        bgMusicIndex = (index >= bgMusicArray.length || index < 0) ? 0 : index;
    }

    BG_MUSIC.src = SOUNDS_PATH + bgMusicArray[bgMusicIndex];
    BG_MUSIC.play();
    // если все файлы проиграны, запускаем все заново, начиная с первого
    bgMusicIndex++;
    if (bgMusicIndex === bgMusicArray.length) bgMusicIndex = 0;

    // вызов playBgMusic по окончанию трека, для воспроизведения следующего
    BG_MUSIC.addEventListener('ended', playBgMusic);
}

// плеер звуковых эффектов
/**
 * @global {boolean} IS_SOUND_EFFECTS_ON - нужно ли проигрывать звуковые эффекты
 * @example пример отключения звуковых эффектов: IS_SOUND_EFFECTS_ON = false;
 */
let IS_SOUND_EFFECTS_ON = true;

/**
 * Проигрывание звукового эффекта
 * @param  {string} soundName - имя файла для воспроизведения
 * @param  {number?} index - порядковый номер стартового трека (не обязательный, по умолчанию 0)
 * @example пример применения: playSound('se_explosion.mp3')
 */
function playSound( soundName ) {
    if (!IS_SOUND_EFFECTS_ON) return;
    // отматываем звук к началу (0 секунд), если он уже воспроизводится
    SE[soundName].currentTime = 0;
    SE[soundName].play();
}