'use strict';

/*
**  ИГРОВЫЕ РЕСУРСЫ ДЛЯ ЗАГРУЗКИ
*/

// переменная пути к изображениям
const IMAGES_PATH = './src/images/';

// переменная пути к звукам
const SOUNDS_PATH = './src/sounds/';

// список загружаемых изображений
const imagesToUploadArray = [
    'algoritmika_space_game_512x282px.png',

    'space_bg_tile_1600x2760px.jpg',
    'space_bg_alpha_tile_1440x724px.png',

    'galaxy_480x420px.png',
    'nebula_1071x1328px.png',
    'nebula_1250x1345px.png',
    'star_94x94px.png',
    'star_106x106px.png',
    'star_dust_1184x842px.png',
    'star_dust_1316x683px.png',
    'star_dust_1388x774px.png',

    'sun_red_580x580px.png',
    'sun_yellow_552x552px.png',
    'planet_76x76px.png',
    'planet_102x102px.png',
    'planet_128x128px.png',
    'planet_154x154px.png',
    'planet_204x204px.png',
    'planet_256x256px.png',
    'space_station_598x408px.png',

    'star_flash_32x32px_11frames.png',

    'cursor_48x48px_16frames.png',

    'player_74x100px_16frames.png',
    'player_bullet_10x40px.png',
    'player_rocket_30x12px.png',
    'sphere_alpha_100x100px_20frames.png',

    'explosion_64x64px_17frames.png',
    'explosion_128x128px_20frames.png',
    'explosion_192x192px_25frames.png',
    'explosion_240x240px_28frames.png',
    'explosion_256x256px_48frames.png',
    'explosion_256x256px_72frames.png',

    'smoke_32x32px_25frames.png',
    'smoke_42x42px_14frames.png',

    'asteroid_90x108px_29frames.png',
    'asteroid_rock_50x50px_8frames.png',

    'enemy_bullet_10x40px.png',
    'enemy_1_52x78px.png',
    'enemy_2_146x62px.png',
    'enemy_3_82x192px.png',
    'enemy_4_100x130px.png',
    'enemy_5_186x126px.png',

    'container_64x64px_36frames.png',
    'bonus_bullets_48x48px.png',
    'bonus_rockets_48x48px.png',
    'bonus_speed_48x48px.png',
    'bonus_repair_48x48px.png',
    'bonus_shield_48x48px.png',
    'bonus_scores_48x48px.png',
];

// список загружаемых звуков
const soundsToUploadArray = [
    'se_bonus.mp3',
    'se_electro_shut.mp3',
    'se_explosion_1.mp3',
    'se_explosion_2.mp3',
    'se_hit.mp3',
    'se_laser_shut_1.mp3',
    'se_laser_shut_2.mp3',
    'se_rock.mp3',
    'se_rocket_launch.mp3',
];

// текст загрузки
const loadingText = 'Загружено:'; // "загружено: 9/12"
// текст кнопки запуска игры
const startButtonText = 'СТАРТ';

// подключаем скрипт загрузки (он загрузит указанные выши файлы)
const script = document.createElement('script');
script.src = './js/engine/loader.js';
document.body.append(script);