'use strict';

/*
**  ИГРОВОЙ ПРОЦЕСС
**  Здесь создаются экземпляры игровых объектов
**  и описывается игровой цикл
**  gameLoop(dt) {
**     // обновление игровых объектов
**  }
*/

// запуск полноэкранного режима
// document.body.requestFullscreen();

// отключаем курсор по умолчанию
document.body.style.cursor = 'none';

// запускаем случайную фоновую музыку в половину громкости
const bgMusicArr = [
    'bgm_space_1.mp3',
    'bgm_space_2.mp3',
    'bgm_space_3.mp3',
];
bgMusicArr.sort(() => Math.random() - 0.5); // перемешиваем треки случайным образом
playBgMusic(bgMusicArr); // отправляем перемешанный массив треков в проигрыватель
BG_MUSIC.volume = 0.7; // задаем громкость фоновой музыки 70%

IS_SOUND_EFFECTS_ON = true; // разрешаем проигрывание звуковых эффектов

// игровая заставка
// класс ScreenSaver описан в файле objects.js
const gameScreenSaver = new ScreenSaver();

// создаем анимированный игровой курсор
const gameCursor = new GameCursor(); // класс GameCursor описан в файле objects.js 

// создаем прокручивающийся игровой фон из тайловых изображений (класс ScrollingBackground описан в файле objects.js)
const bgTilesArr = [
    //                    имя файла с изображением, скорость прокрутки
    new ScrollingBackground('space_bg_tile_1600x2760px.jpg', 0.01),
    new ScrollingBackground('space_bg_alpha_tile_1440x724px.png', 0.012),
];

// создаем массив с фоновыми изображениями космоса (класс BackgroundSprite описан в файле objects.js)
const bgSpaceObjectsArr = [
    // имя файла с изображением, скорость прокрутки, время задержки (миллисекунд)
    new BackgroundSprite('galaxy_480x420px.png', 0.014, 120000),
    new BackgroundSprite('nebula_1071x1328px.png', 0.015, 35000),
    new BackgroundSprite('nebula_1250x1345px.png', 0.016, 40000),
    new BackgroundSprite('star_dust_1184x842px.png', 0.017, 18000),
    new BackgroundSprite('star_dust_1316x683px.png', 0.018, 17000),
    new BackgroundSprite('star_dust_1388x774px.png', 0.019, 16000),
    new BackgroundSprite('star_94x94px.png', 0.02, 20000),
    new BackgroundSprite('star_106x106px.png', 0.022, 25000),

    new BackgroundSprite('sun_red_580x580px.png', 0.024, 240000),
    new BackgroundSprite('sun_yellow_552x552px.png', 0.026, 200000),
    new BackgroundSprite('planet_256x256px.png', 0.03, 170000),
    new BackgroundSprite('planet_204x204px.png', 0.035, 140000),
    new BackgroundSprite('planet_154x154px.png', 0.04, 120000),
    new BackgroundSprite('planet_128x128px.png', 0.045, 100000),
    new BackgroundSprite('planet_102x102px.png', 0.05, 80000),
    new BackgroundSprite('planet_76x76px.png', 0.055, 67000),
    new BackgroundSprite('space_station_598x408px.png', 0.06, 180000),
];

// создаем массив, в котором будет ингода появляться вспыхивающая звезда
let starsArr = [];
const starProbability = 0.01; // вероятность появления вспыхивающей звезды 1%
function addStar() {
    const x = Math.random() * VIEW.width;
    const y = Math.random() * VIEW.height;
    // класс OneLoopSpriteSheet описан в файле objects.js, ниже перечисленны параметры его конструктора
    // имя файла с изображением, x, y, ширина кадра, высота кадра, количество кадров, скорость анимации (FPS)
    const star = new OneLoopSpriteSheet('star_flash_32x32px_11frames.png', x, y, 32, 32, 11, 18);
    starsArr.push(star);
}

// массив текстовых сообщений, которые плавно движутся вверх и исчезают
let messagesArr = [];

const player = new Player();
const playerTextOptions = {weight: 'bold', size: 28, family: 'PTSans', color: '#ffffff', strokeWidth: 1, strokeColor: "#ff00ff"};
const playerHPText = new TextSprite(`HP: ${player.hp}%`, 5, 5, playerTextOptions);
const playerRocketsText = new TextSprite(`Rockets: ${player.rockets}`, VIEW.x, 5, {align: "center", ...playerTextOptions});
playerRocketsText.resizingScreen = function() {this.x = VIEW.x;};
VIEW_DEPENDS_OBJECTS_ARR.push(playerRocketsText);
const playerScoreText = new TextSprite(`Scores: ${player.scores}`, VIEW.width - 5, 5, {align: "right", ...playerTextOptions});
playerScoreText.resizingScreen = function() {this.x = VIEW.width - 5;};
VIEW_DEPENDS_OBJECTS_ARR.push(playerScoreText);
const playerTextsArr = [playerHPText, playerRocketsText, playerScoreText];

// текст завершения игры
const gameOverText = new TextSprite('GAME OVER', VIEW.x, VIEW.y, {
    weight: 'bold', size: 60, family: 'PTSans', align: "center", color: '#000000', strokeWidth: 3, strokeColor: "#ff0000"
});
gameOverText.resizingScreen = function() {this.x = VIEW.x; this.y = VIEW.y;}; // при смены размера экрана переопределяем координаты
VIEW_DEPENDS_OBJECTS_ARR.push(gameOverText); // добавляем в массив объектов, зависимых от изменений размеров экрана

let explosionsArr = [];
let smokeArr = [];

let asteroidsArr = [];
let maxAsteroids = 3;
let addAsteroidStep = 0.2;
function addAsteroid() {
    asteroidsArr.push(new Asteroid());
}

let rocksArr = [];

let enemiesArr = [];
let maxEnemies = 2;
let addEnemyStep = 0.1;
function addEnemy() {
    const type = Math.ceil(maxEnemies * Math.random());
    switch( type ) {
        case  4: enemiesArr.push(new Enemy2()); break; // наводящийся враг
        case  5:
        case  6: enemiesArr.push(new Enemy3()); break; // бонусный враг
        case  7:
        case  8: enemiesArr.push(new Enemy4()); break; // многозарядный враг
        case  9:
        case 10: enemiesArr.push(new Enemy5()); break; // электрический враг
        default:
            if (type > 5 && Math.random() < 0.5) enemiesArr.push(new Enemy4()); // многозарядный враг 
            else enemiesArr.push(new Enemy1()); // обычный враг
    }
}

let enemiesBulletsArr = [];

let containersArr = [];
function addContainer(x, y) {
    if (Math.random() < 0.25) containersArr.push(new Container(x, y));
}
let bonusesArr = [];
function addBonus(x, y) {
    const type = Math.ceil(6 * Math.random());
    switch( type ) {
        case  1: bonusesArr.push(new Bonus('bonus_shield_48x48px.png', x, y)); break;
        case  2: bonusesArr.push(new Bonus('bonus_bullets_48x48px.png', x, y)); break;
        case  3: bonusesArr.push(new Bonus('bonus_speed_48x48px.png', x, y)); break;
        case  4: bonusesArr.push(new Bonus('bonus_repair_48x48px.png', x, y)); break;
        case  5: bonusesArr.push(new Bonus('bonus_rockets_48x48px.png', x, y)); break;
        default: bonusesArr.push(new Bonus('bonus_scores_48x48px.png', x, y));
    }
}

/** 
 * ГЛАВНЫЙ ИГРОВОЙ ЦИКЛ (вызывается из файла render.js после загрузки игры)
 * здесь описываются все игровые изменения при обновлении экрана 
 * (dt - время в миллисекундах между обновлениями экрана)
 */
function gameLoop(dt) {
    // обновляем фоны тайлов
    bgTilesArr.forEach( bgTile => bgTile.update(dt) );

    // обновляем вспышки звезд
    starsArr.forEach( star => star.update(dt) );
    starsArr = starsArr.filter(object => object.isExist);
    if (!starsArr.length && Math.random() < starProbability) addStar();

    // обновляем фоновые элементы космоса
    bgSpaceObjectsArr.forEach( bgSpaceObject => bgSpaceObject.update(dt) );
    bgSpaceObjectsArr[0].imageAngle -= 0.0005;

    // обновляем игровые объекты
    smokeArr.forEach( smoke => smoke.update(dt) );
    smokeArr = smokeArr.filter(object => object.isExist);

    bonusesArr.forEach( bonus => bonus.update(dt) );
    bonusesArr = bonusesArr.filter(object => object.isExist);

    containersArr.forEach( container => container.update(dt) );
    containersArr = containersArr.filter(object => object.isExist);

    enemiesBulletsArr.forEach( enemyBullet => enemyBullet.update(dt) );
    enemiesBulletsArr = enemiesBulletsArr.filter(object => object.isExist);

    enemiesArr.forEach( enemy => enemy.update(dt) );
    enemiesArr = enemiesArr.filter(object => object.isExist);
    if (enemiesArr.length < maxEnemies) addEnemy();

    rocksArr.forEach( rock => rock.update(dt) );
    rocksArr = rocksArr.filter(object => object.isExist);

    asteroidsArr.forEach( asteroid => asteroid.update(dt) );
    asteroidsArr = asteroidsArr.filter(object => object.isExist);
    if (asteroidsArr.length < maxAsteroids) addAsteroid();
    
    if (player.hp > 0) player.update(dt);
    else gameOverText.draw();

    explosionsArr.forEach( explosion => explosion.update(dt) );
    explosionsArr = explosionsArr.filter(object => object.isExist);

    // обновляем текст
    messagesArr.forEach( message => message.update(dt) );
    messagesArr = messagesArr.filter(object => object.isExist);

    // обновляем курсор
    gameCursor.update(dt);

    // Обновление игровой информации
    playerTextsArr.forEach(text => text.draw());

    // показываем при запуске название игры
    if (gameScreenSaver.alpha > 0) gameScreenSaver.update(dt);

    // регулировка громкости фоновой музыки
    if (KEY.down && BG_MUSIC.volume >= 0.005) BG_MUSIC.volume -= 0.005;
    if (KEY.up && BG_MUSIC.volume < 1 - 0.005) BG_MUSIC.volume += 0.005;
}
// ЗАПУСК ИГРЫ (render.js)
startGameRender();