'use strict';

/*
**  КЛАССЫ (и миксины) ИГРОВЫХ ОБЪЕКТОВ
*/

class ScreenSaver {
    constructor() {
        this.img = IMG['algoritmika_space_game_512x282px.png'];
        this.width = (VIEW.width > 512) ? 512 : 256;
        this.height = (VIEW.width > 512) ? 282 : 141;
        this.x = (VIEW.width / 2) - (this.width / 2);
        this.y = (VIEW.height / 2) - (this.height / 2);
        this.visibleTime = 1500;
        this.exitTime = 2500;
        this.alpha = 1;
        this.alphaStep = 1 / this.exitTime;
    }

    update(dt) {
        if (this.visibleTime > 0) this.visibleTime -= dt;
        else this.alpha -= this.alphaStep * dt;
        if (this.alpha <= 0) return;
    
        if (this.alpha === 1) CONTEXT.drawImage(this.img, this.x, this.y, this.width, this.height);
        else {
            CONTEXT.save();
            CONTEXT.globalAlpha = this.alpha;
            CONTEXT.drawImage(this.img, this.x, this.y, this.width, this.height);
            CONTEXT.restore();
        }
    }
}

// Игровой курсор
class GameCursor extends SpriteSheet {
    constructor() {
        // вызываем конструктор родительского класса анимированного спрайта SpriteSheet
        // изображение, x, y, ширина кадра, высота кадра, число кадров, частота обновления
        super('cursor_48x48px_16frames.png', VIEW.x, VIEW.y, 48, 48, 16, 15);
    }

    // при каждом обновлении экрана будем переносить наш курсор к указателю мыши или точки касания экрана
    update(dt) {
        this.x = CURSOR.x;
        this.y = CURSOR.y;
        this.drawWithAnimation(dt);
    }
}

// Движущееся фоновое изображение из тайлов
class ScrollingBackground extends TileSprite {
    constructor (imageName, scrollSpeed) {
        // вызываем конструктор родительского класса тайлового спрайта TileSprite
        // изображение, x, y, ширина кадра, высота кадра, число кадров, частота обновления
        super(imageName, VIEW.x, VIEW.y, VIEW.width, VIEW.height + IMG[imageName].height, 'center', 'center');
        this.tileHeight = IMG[imageName].height; 
        this.y -= Math.floor(this.tileHeight / 2);
        this.restartPointY = this.y + this.tileHeight;
        this.scrollSpeed = scrollSpeed;
        VIEW_DEPENDS_OBJECTS_ARR.push(this); // добавляем в список объектов, зависимых от размеров экрана
    }

    // вызывается при изменении размеров экрана из render.js
    resizingScreen() {
        // заменяем тайл на новый, с размерами под новое разрешение экрана
        const previousImageName = this.img.imageName;
        const newTileHeight = VIEW.height + IMG[this.tileName].height;
        const tile = IMG[this.tileName];

        let offsetX, offsetY;
        if (VIEW.width > tile.width) offsetX = -Math.floor( (tile.width - (VIEW.width % tile.width)) / 2 );
        if (VIEW.width < tile.width) offsetX = -Math.floor( (tile.width - VIEW.width) / 2 );
    
        if (newTileHeight > tile.height) offsetY = -Math.floor( (tile.height - (newTileHeight % tile.height)) / 2 );
        if (newTileHeight < tile.height) offsetY = -Math.floor( (tile.height - newTileHeight) / 2 );
    
        const img = document.createElement('canvas');
        img.width = VIEW.width;
        img.height = newTileHeight;
        const imgContext = img.getContext('2d');
    
        for( let yy = offsetY; yy < newTileHeight; yy += tile.height) {
            for( let xx = offsetX; xx < VIEW.width; xx += tile.width) {
                imgContext.drawImage(tile, xx, yy);
            }
        }
    
        img.imageName = `tile_${VIEW.width}x${newTileHeight}px_center_center_from_${this.tileName}`;
        IMG[img.imageName] = img;
        this.img = img;

        delete IMG[previousImageName];
    }

    // при каждом обновлении экрана двигаем фон с заданной скоростью, если пролистали весь - возвращаем в начало
    update(dt) {
        this.y += this.scrollSpeed * dt;
        if (this.y >= this.restartPointY) this.y -= this.tileHeight;
        this.draw();
    }
}

// Фоновый спрайт
class BackgroundSprite extends Sprite {
    constructor (imageName, scrollSpeed, periodicity) {
        // вызываем конструктор родительского класса спрайта Sprite
        //     изображение, x, y,
        super(imageName, Math.floor(Math.random() * VIEW.width), 0);
        this.scrollSpeed = scrollSpeed;
        this.periodicity = periodicity;
        this.startPointY = -(scrollSpeed * periodicity);
        this.restartPointY = VIEW.height + this.halfHeight;
        this.y = VIEW.height - (VIEW.height + -this.startPointY) * Math.random();
        VIEW_DEPENDS_OBJECTS_ARR.push(this); // добавляем в список объектов, зависимых от размеров экрана
    }

    // вызывается при изменении размеров экрана из render.js
    resizingScreen() {
        this.restartPointY = VIEW.height + this.halfHeight;
        this.startPointY = -(this.scrollSpeed * this.periodicity);
    }

    // при каждом обновлении экрана двигаем с заданной скоростью, если ушло за экран - возвращаем в начало
    update(dt) {
        this.y += this.scrollSpeed * dt;
        if (this.y >= this.restartPointY) {
            this.x = Math.floor(Math.random() * VIEW.width);
            this.y = this.startPointY;
        }
        if (checkObjectVisibility(this)) this.draw(); // рисуем, если в зоне видимости
    }
}

// Анимированный объект с разовым циклом анимации (взрывы, дым и т.п.)
class OneLoopSpriteSheet extends SpriteSheet {
    constructor(imageName, x, y, frameWidth, frameHeight, frames, fps = 60) {
        // вызываем конструктор родительского класса анимированного спрайта SpriteSheet
        // изображение, x, y, ширина кадра, высота кадра, число кадров, частота обновления, угол поворота изображения
        super(imageName, x, y, frameWidth, frameHeight, frames, fps, Math.random() * _2PI);
    }

    // рисуем с анимацией при каждом обновлении экрана
    // если дошли до последнего кадра - переключаем поле isExist в false (для фильтровки ненужных спрайтов)
    update(dt) {
        if (this.frame === this.frames - 1) this.isExist = false;
        else this.drawWithAnimation(dt);
    }
}

// Текст для очков со свечением и плавным исчезновением
class MessageText extends TextSprite {
    constructor(text, x, y) {
        // вызываем конструктор родительского класса текстового спрайта TextSprite
        // текст, x, y, объект опций
        super(text, x, y, {weight: 'bold', size: 20, family: 'PTSans', fillColor: '#ffff00', align: 'center'});
        this.shadowColor = '#ff00ff'; // цвет свечения
        this.hideTime = 2000; // время, сколько текст будет исчезать (в миллисекундах)
        this.visibleTime = 1000; // время, сколько текст будет виден (в миллисекундах)
        this.alphaStepPerMillisecond = 1 / this.hideTime; // на сколько должна изменяться прозрачность (каждую миллисекунду)
        this.speedY = 0.02;
        this.alpha = 1; // начальное значение прозрачности (1 - полностью не прозрачный, 0 - полностью прозрачный)
    }

    // отрисовка движущегося вверх текста, с плавным исчезновением
    // если дошли до alpha = 0 - переключаем поле isExist в false (для фильтровки ненужных спрайтов)
    update(dt) {
        this.y -= this.speedY * dt;

        if (this.alpha === 1) {
            this.visibleTime -= dt;
            if (this.visibleTime <= 0) this.alpha -= this.alphaStepPerMillisecond * dt;
        } else {
            this.alpha -= this.alphaStepPerMillisecond * dt;
        }

        if (this.alpha <= 0) {
            this.isExist = false;
            return;
        }

        // создание свечения и прозрачности
        CONTEXT.save(); // сохраняем контекст (чтобы эффекты прозрачности и свечения не влияли на другие спрайты)
        if (this.alpha < 1) CONTEXT.globalAlpha = this.alpha;
        CONTEXT.shadowBlur  = 5; // задаем размытие свечению
        CONTEXT.shadowColor = this.shadowColor; // задаем цвет свечения
        CONTEXT.globalCompositeOperation = 'lighter'; // указываем тип свечения
        this.draw();
        CONTEXT.restore(); // восстанавливаем контекст в начальное состояние (до вызова метода CONTEXT.save())
    }
}

//////////////////////

class Player extends SpriteSheet {
    constructor() {
        super('player_74x100px_16frames.png', VIEW.x, VIEW.height + 100, 74, 100, 16, 30);
        this.speed = 0.12;
        this.hp = 100;
        this.scores = 0;

        this.rockets = 3;
        this.rocketsArr = [];
        this.rocketReloadSpeed = 1000;
        this.rocketReloadTimeout = this.rocketReloadSpeed;

        this.bulletsArr = [];
        this.bulletReloadSpeed = 2000;
        this.bulletReloadTimeout = this.bulletReloadSpeed;

        this.sphere = new SpriteSheet('sphere_alpha_100x100px_20frames.png', 0, 0, 100, 100, 20, 30);
        this.sphereRotationSpeed = 0.0005;
        this.sphereTimeout = 0;
    }

    update(dt) {
        // перемещаемся к курсору
        moveObjectToTarget(this, CURSOR, this.speed * dt);

        // перезарядка и стрельба пулями
        this.bulletReloadTimeout -= dt;
        if (this.bulletReloadTimeout <= 0) {
            this.bulletReloadTimeout += this.bulletReloadSpeed;
            this.bulletsArr.push( new PlayerBullet(this.x, this.y));
        }
        this.bulletsArr = this.bulletsArr.filter(object => object.isExist);
        this.bulletsArr.forEach( bullet => bullet.update(dt) );

        // перезарядка и стрельба ракетами
        if (this.rocketReloadTimeout > 0) this.rocketReloadTimeout -= dt;
        if ( (CURSOR.isClicked || KEY.space) && this.rocketReloadTimeout <= 0 && this.rockets ) {
            this.rockets--;
            playerRocketsText.render(`Rockets: ${this.rockets}`);
            this.rocketReloadTimeout += this.rocketReloadSpeed;
            const rocket = new PlayerRocket(this.x, this.y);
            this.rocketsArr.push(rocket);
        }
        this.rocketsArr = this.rocketsArr.filter(object => object.isExist);
        this.rocketsArr.forEach( rocket => rocket.update(dt) );

        this.drawWithAnimation(dt);
        if (this.sphereTimeout > 0) {
            this.sphereTimeout -= dt;
            this.sphere.x = this.x;
            this.sphere.y = this.y;
            this.sphere.imageAngle += this.sphereRotationSpeed * dt;
            if (this.sphereTimeout > 2000) this.sphere.drawWithAnimation(dt);
            else if (this.sphereTimeout > 0) {
                CONTEXT.save();
                CONTEXT.globalAlpha = this.sphereTimeout / 2000;
                this.sphere.drawWithAnimation(dt);
                CONTEXT.restore();
            }
        }
    }

    addDamage(damage) {
        if (this.sphereTimeout > 0) return;

        this.hp -= damage;
        if (this.hp > 0) playerHPText.render(`HP: ${this.hp}%`);
        else this.destroy();
        
    }

    addScores(scores, x, y) {
        if (this.hp < 0) return;
        messagesArr.push( new MessageText(`+${scores}`, x, y) )
        this.scores += scores;
        playerScoreText.render(`Scores: ${this.scores}`)
    }

    destroy() {
        playerHPText.render(`HP: ${0}%`);
        explosionsArr.push(new Explosion(this.x, this.y, 5));
        this.y = VIEW.height * 2;
        playBgMusic(['bgm_game_over.mp3'], 0);   
    }
}

class PlayerBullet extends Sprite {
    constructor(x, y) {
        super('player_bullet_10x40px.png', x, y);
        this.speed = 0.5;
        this.damage = 1;

        playSound('se_laser_shut_1.mp3');
    }

    update(dt) {
        this.y -= this.speed * dt;
        if (this.y < -this.halfHeight) this.isExist = false;
        else this.draw();
    }
}

class PlayerRocket extends Sprite {
    constructor(x, y) {
        super('player_rocket_30x12px.png', x, y, -(Math.PI / 2));
        this.speed = 0.05;
        this.acceleration = 0.0005;
        this.turnSpeed = 0.0015;
        this.damage = 5;

        this.smokeDelay = 10;
        this.smokeTimeout = this.smokeDelay;

        playSound('se_rocket_launch.mp3');
    }

    update(dt) {
        // обновляем цель
        this.turnToTarget(dt);
        // движение
        moveObject(this, this.speed * dt);

        // проверяем видимость
        if (!checkObjectVisibility(this)) {
            this.isExist = false;
            return;
        }
        
        // добавление дыма
        this.smokeTimeout -= dt;
        if (this.smokeTimeout <= 0) {
            this.smokeTimeout += this.smokeDelay;
            //            class Smoke(x, y)
            smokeArr.push( new Smoke(this.x, this.y));
        }
        // рисуем
        this.draw();
    }

    turnToTarget(dt) {
        let target = {x: VIEW.x, y: -50};
        let minDistance = Infinity;

        asteroidsArr.forEach( asteroid => {
            const distance = getDistance(this, asteroid);
            if (distance < minDistance) {
                target = asteroid;
                minDistance = distance;
            }
        });

        enemiesArr.forEach( enemy => {
            const distance = getDistance(this, enemy);
            if (distance < minDistance) {
                target = enemy;
                minDistance = distance;
            }
        });

        this.speed += this.acceleration * dt;
        turnObjectToTarget(this, target, this.turnSpeed * dt);
    }
}

class Explosion extends OneLoopSpriteSheet {
    constructor(x, y, type = 0) {
        switch(type) {
            case 1 : super('explosion_64x64px_17frames.png', x, y, 64, 64, 17, 30); playSound('se_hit.mp3'); break;
            case 2 : super('explosion_192x192px_25frames.png', x, y, 192, 192, 25, 30); playSound('se_rock.mp3'); break;
            case 3 : super('explosion_240x240px_28frames.png', x, y, 240, 240, 28, 30); playSound('se_explosion_1.mp3'); break;
            case 4 : super('explosion_256x256px_48frames.png', x, y, 256, 256, 48, 30); playSound('se_explosion_1.mp3'); break;
            case 5 : super('explosion_256x256px_72frames.png', x, y, 256, 256, 72, 30); playSound('se_explosion_1.mp3'); break;
            default: super('explosion_128x128px_20frames.png', x, y, 128, 128, 20, 30); playSound('se_explosion_2.mp3'); 
        }
    }
}

class Smoke extends OneLoopSpriteSheet {
    constructor(x, y) {
        super('smoke_42x42px_14frames.png', x, y, 42, 42, 14, 12);
    }
}

const mixinAddDamage = {
    // получение урона
    addDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) this.destroy();
    }
}

const mixinDestroy = {
    destroy() {
        maxEnemies += addEnemyStep;
        this.isExist = false;
        explosionsArr.push(new Explosion(this.x, this.y, 4));
        if (this.isAddBonus) addContainer(this.x, this.y);
    }
}

const mixinCheckPlayerCollision = {
    // проверка столкновения с игроком
    checkPlayerCollision() {
        if (getDistance(this, player) < this.size + player.size) {
            this.destroy();
            player.addDamage(this.damage);
        }
    }
}

const mixinCheckPlayerBulletCollision = {
    // проверка столкновений с пулями игрока
    checkPlayerBulletCollision() {
        player.bulletsArr.forEach( bullet => {
            if (bullet.isExist && getDistance(this, bullet) < this.size) {
                explosionsArr.push(new Explosion(bullet.x, bullet.y, 1));
                bullet.isExist = false;
                this.addDamage(bullet.damage);
                if (this.hp > 0) player.addScores(this.hitScoresPlayerBullet, this.x, this.y);
                else player.addScores(this.destroyScoresPlayerBullet, this.x, this.y);
            }
        });
    }
}

const mixinCheckPlayerRocketCollision = {
    // проверка столкновения с ракетами игрока
    checkPlayerRocketCollision() {
        player.rocketsArr.forEach( rocket => {
            if (rocket.isExist && getDistance(this, rocket) < this.size) {
                explosionsArr.push(new Explosion(rocket.x, rocket.y, 0));
                rocket.isExist = false;
                this.addDamage(rocket.damage);
                if (this.hp > 0) player.addScores(this.hitScoresPlayerRocket, this.x, this.y);
                else player.addScores(this.destroyScoresPlayerRocket, this.x, this.y);
            }
        });
    }
}

const mixinCheckAsteroidCollision = {
    // проверка столкновения с астероидами
    checkAsteroidCollision() {
        asteroidsArr.forEach( asteroid => {
            if (asteroid.isExist && getDistance(this, asteroid) < this.size + asteroid.size) {
                asteroid.destroy();
                this.addDamage(asteroid.damage);
            }
        });
    }
}

const mixinCheckRockCollision = {
    // проверка столкновения с камнями
    checkRockCollision() {
        rocksArr.forEach( rock => {
            if (rock.isExist && getDistance(this, rock) < this.size + rock.size) {
                rock.destroy();
                this.addDamage(rock.damage);
            }
        });
    }
}

class Asteroid extends SpriteSheet {
    constructor() {
        super('asteroid_90x108px_29frames.png',
        /* x */  Math.random() * VIEW.width,
        /* y */ -108 - (Math.random() * 300),
        /* frame info */  90, 108, 29, 30,
        /* imageAngle */ Math.random() * _2PI);
        this.direction = getRandomFloatFromRange(Math.PI / 6 /* 30 deg. */, Math.PI * 0.84 /* 120 deg. */);
        this.speed = getRandomFloatFromRange(0.06, 0.12);
        this.rotationSpeed = this.speed / 60;
        this.hp = Math.round(getRandomFloatFromRange(2, 4));
        this.damage = this.hp * 3;
        this.rocks = this.hp + 1;

        this.hitScoresPlayerBullet = this.hp;
        this.destroyScoresPlayerBullet = this.hp * 5;
        this.hitScoresPlayerRocket = 1;
        this.destroyScoresPlayerRocket= this.hp;
    }

    update(dt) {
        if (this.isExist === false) return;
        this.move(dt);
        if (this.isExist === false) return;
        this.checkRockCollision();
        if (this.isExist === false) return;
        this.checkPlayerCollision();
        if (this.isExist === false) return;
        this.checkPlayerBulletCollision();
        if (this.isExist === false) return;
        this.checkPlayerRocketCollision();
        if (this.isExist === false) return;
        this.drawWithAnimation(dt);
    }

    move(dt) {
        moveObject(this, this.speed * dt);
        this.imageAngle += this.rotationSpeed * dt;
        if (this.y > this.halfHeight + VIEW.height) this.isExist = false;
    }

    destroy() {
        maxAsteroids += addAsteroidStep;
        this.isExist = false;
        explosionsArr.push(new Explosion(this.x, this.y, 3));

        // создаем камни
        const stepAngle = _2PI / this.rocks;
        for(let i = 0; i < this.rocks; i++) {
            const direction = i * stepAngle + Math.random() * stepAngle;
            rocksArr.push(new Rock(this.x, this.y, this.speed * 2, direction));
        }
    }
}
// подключаем дополнительные методы
Object.assign(Asteroid.prototype,
    mixinAddDamage,
    mixinCheckRockCollision,
    mixinCheckPlayerBulletCollision,
    mixinCheckPlayerRocketCollision,
    mixinCheckPlayerCollision
);

class Rock extends SpriteSheet {
    constructor(x, y, speed, direction) {
        super('asteroid_rock_50x50px_8frames.png', x, y, 50, 50, 8, 30, direction);
        this.rotationSpeed = speed / 60;
        this.speed = speed;
        this.hp = 1;
        this.damage = 5;
        
        this.hitScoresPlayerBullet = this.hp;
        this.destroyScoresPlayerBullet = this.hp * 5;
        this.hitScoresPlayerRocket = 1;
        this.destroyScoresPlayerRocket= this.hp;
    }

    update(dt) {
        if (this.isExist === false) return;
        this.move(dt);
        if (this.isExist === false) return;
        this.checkPlayerCollision();
        if (this.isExist === false) return;
        this.checkPlayerBulletCollision();
        if (this.isExist === false) return;
        this.drawWithAnimation(dt);
    }

    move(dt) {
        moveObject(this, this.speed * dt);
        this.imageAngle += this.rotationSpeed * dt;
        if (!checkObjectVisibility(this)) this.isExist = false;
    }

    destroy() {
        this.isExist = false;
        explosionsArr.push(new Explosion(this.x, this.y, 2));
    }
}
Object.assign(Rock.prototype,
    mixinAddDamage,
    mixinCheckPlayerBulletCollision,
    mixinCheckPlayerCollision
);

class EnemySprite extends Sprite {
    update(dt) {
        if (this.isExist === false) return;
        this.action(dt);
        if (this.isExist === false) return;
        this.checkPlayerBulletCollision();
        if (this.isExist === false) return;
        this.checkPlayerRocketCollision();
        if (this.isExist === false) return;
        this.checkPlayerCollision();
        if (this.isExist === false) return;
        this.checkRockCollision();
        if (this.isExist === false) return;
        this.draw();
    }
}
Object.assign(EnemySprite.prototype,
    mixinAddDamage,
    mixinDestroy,
    mixinCheckPlayerBulletCollision,
    mixinCheckPlayerRocketCollision,
    mixinCheckPlayerCollision,
    mixinCheckRockCollision
);

class Enemy1 extends EnemySprite { // вертикальный палет, одиночные выстрелы
    constructor() {
        super('enemy_1_52x78px.png', Math.random() * VIEW.width, -39);
        this.hp = 2;
        this.speed = 0.035;
        this.damage = 10;

        this.bulletReloadSpeed = 3500;
        this.bulletReloadTimeout = this.bulletReloadSpeed;

        this.hitScoresPlayerBullet = this.hp;
        this.destroyScoresPlayerBullet = this.hp * 5;
        this.hitScoresPlayerRocket = 1;
        this.destroyScoresPlayerRocket= this.hp;

        this.isAddBonus = true;
    }

    action(dt) {
        // движение
        this.y += this.speed * dt;
        if (this.y > this.halfHeight + VIEW.height) {
            this.isExist = false;
            return;
        }

        // стрельба
        this.bulletReloadTimeout -= dt;
        if (this.bulletReloadTimeout <= 0) {
            this.bulletReloadTimeout += this.bulletReloadSpeed;
            enemiesBulletsArr.push(new EnemyBullet(this.x, this.y));
        }
    }
}

class Enemy2 extends EnemySprite { // наводится на игрока, не стреляет
    constructor() {
        super('enemy_2_146x62px.png', Math.random() * VIEW.width, -73, Math.PI / 2);
        this.hp = 3;
        this.speed = 0.04;
        this.turnSpeed = 0.0003;
        this.damage = 20;

        this.hitScoresPlayerBullet = this.hp;
        this.destroyScoresPlayerBullet = this.hp * 5;
        this.hitScoresPlayerRocket = 1;
        this.destroyScoresPlayerRocket= this.hp;

        this.isAddBonus = true;
    }

    action(dt) {
        // движение
        turnObjectToTarget(this, player, this.turnSpeed * dt);
        moveObject(this, this.speed * dt);
        if (!checkObjectVisibility(this)) this.isExist = false;
    }
}

class Enemy3 extends EnemySprite { // летит вниз, не стреляет, везет бонусы
    constructor() {
        super('enemy_3_82x192px.png', Math.random() * VIEW.width, -96);
        this.hp = 6;
        this.speed = 0.03;
        this.damage = 15;
        this.containers = 6;

        this.hitScoresPlayerBullet = this.hp;
        this.destroyScoresPlayerBullet = this.hp * 5;
        this.hitScoresPlayerRocket = 1;
        this.destroyScoresPlayerRocket= this.hp;
    }

    action(dt) {
        // движение
        this.y += this.speed * dt;
        if (this.y > this.halfHeight + VIEW.height) this.isExist = false;
    }

    destroy() {
        maxEnemies += addEnemyStep;
        this.isExist = false;
        explosionsArr.push(new Explosion(this.x, this.y, 4));
        for (let i = 0; i < this.containers; i++) addContainer(this.x, this.y);
    }
}

class Enemy4 extends EnemySprite { // летит вниз, по горизонтали подстраивается под игрока, тройные выстрелы по две пули
    constructor() {
        super('enemy_4_100x130px.png', Math.random() * VIEW.width, -65);
        this.hp = 4;
        this.speed = 0.05;
        this.speedX = 0.01;
        this.damage = 12;

        this.shuts = 3;
        this.bullets = this.shuts;
        this.bulletShutDelay = 500;
        this.bulletShutTimeout = this.bulletShutDelay;
        this.bulletReloadSpeed = 3500;
        this.bulletReloadTimeout = this.bulletReloadSpeed;

        this.hitScoresPlayerBullet = this.hp;
        this.destroyScoresPlayerBullet = this.hp * 5;
        this.hitScoresPlayerRocket = 1;
        this.destroyScoresPlayerRocket= this.hp;

        this.isAddBonus = true;
    }

    action(dt) {
        // движение
        this.y += this.speed * dt;
        if (this.y > this.halfHeight + VIEW.height) {
            this.isExist = false;
            return;
        }
        if (this.x > player.x) this.x -= this.speedX * dt;
        else this.x += this.speedX * dt;

        // перезарядка и стрельба пулями
        if (this.bullets > 0) {
            this.bulletShutTimeout -= dt;
            if (this.bulletShutTimeout <= 0) {
                this.bullets--;
                this.bulletShutTimeout += this.bulletShutDelay;
                enemiesBulletsArr.push(new EnemyBullet(this.x - 30, this.y));
                enemiesBulletsArr.push(new EnemyBullet(this.x + 30, this.y));
            }
        } else {
            this.bulletReloadTimeout -= dt;
            if (this.bulletReloadTimeout <= 0) {
                this.bulletReloadTimeout += this.bulletReloadSpeed;
                this.bullets = this.shuts;
            }
        }
    }
}

class Enemy5 extends EnemySprite { // наводится на игрока, стреляет электричеством
    constructor() {
        super('enemy_5_186x126px.png', Math.random() * VIEW.width, -93, Math.PI / 2);
        this.hp = 5;
        this.speed = 0.045;
        this.turnSpeed = 0.0003;
        this.damage = 15;

        this.lightningDamage = 12;
        this.lightningShutDistance = 200 + this.size + player.size;
        this.lightningShutDuration = 500;
        this.lightningShutTimeout = this.lightningShutDuration;
        this.lightningReloadSpeed = 3500;
        this.lightningReloadTimeout = this.lightningReloadSpeed;
        this.isLightningSoundPlay = false;

        this.hitScoresPlayerBullet = this.hp;
        this.destroyScoresPlayerBullet = this.hp * 5;
        this.hitScoresPlayerRocket = 1;
        this.destroyScoresPlayerRocket= this.hp;

        this.isAddBonus = true;
    }

    action(dt) {
        // движение
        turnObjectToTarget(this, player, this.turnSpeed * dt);
        moveObject(this, this.speed * dt);
        if (!checkObjectVisibility(this)) {
            this.isExist = false;
            return;
        }

        // перезарядка и стрельба
        if (this.lightningShutTimeout > 0) {
            if (getDistance(this, player) < this.lightningShutDistance) {
                drawLightning(this, player);
                this.lightningShutTimeout -= dt;
                if (this.lightningShutTimeout <= 0) player.addDamage(this.lightningDamage);

                if (this.isLightningSoundPlay === false) {
                    this.isLightningSoundPlay = true;
                    playSound('se_electro_shut.mp3');
                }
            } else {
                this.isLightningSoundPlay = false;
            }
        } else {
            this.lightningReloadTimeout -= dt;
            if (this.lightningReloadTimeout <= 0) {
                this.lightningReloadTimeout += this.lightningReloadSpeed;
                this.lightningShutTimeout = this.lightningShutDuration;
                this.isLightningSoundPlay = false;
            }
        }
    }
}

class EnemyBullet extends Sprite {
    constructor(x, y) {
        super('enemy_bullet_10x40px.png', x, y);
        this.speed = 0.15;
        this.power = 1;

        playSound('se_laser_shut_2.mp3');
    }

    update(dt) {
        this.y += this.speed * dt;
        if (this.y > this.halfHeight + VIEW.height) {
            this.isExist = false;
            return;
        }

        // проверка столкновения с игроком
        if ( getDistance(this, player) < player.size ) {
            player.addDamage(this.power);
            this.isExist = false;
            explosionsArr.push(new Explosion(this.x, this.y, 1));
        } else this.draw();
    }
}

class Bonus extends Sprite {
    constructor(imageName, x, y) {
        super(imageName, x, y);
        this.imageName = imageName;
        this.speed = 0.03;
    }

    update(dt) {
        this.y += this.speed * dt;
        if (this.y > this.halfHeight + VIEW.height) {
            this.isExist = false;
            return;
        }
        
        if (getDistance(this, player) < this.size + player.size) {
            this.isExist = false;
            switch(this.imageName) {
                case 'bonus_bullets_48x48px.png' :
                    player.bulletReloadSpeed *= 0.8;
                    messagesArr.push(new MessageText('+20% SHUT SPEED', player.x, player.y));
                break;

                case 'bonus_rockets_48x48px.png' :
                    player.rockets++;
                    playerRocketsText.render(`Rockets: ${player.rockets}`);
                    messagesArr.push(new MessageText('+1 ROCKET', player.x, player.y));
                break;

                case 'bonus_speed_48x48px.png' :
                    player.speed *= 1.2;
                    messagesArr.push(new MessageText('+20% SPEED', player.x, player.y));
                break;

                case 'bonus_repair_48x48px.png' :
                    player.hp += 20;
                    if (player.hp > 100) player.hp = 100;
                    playerHPText.render(`HP: ${player.hp}%`);
                    messagesArr.push(new MessageText('+20% HP', player.x, player.y));
                break;

                case 'bonus_shield_48x48px.png' :
                    player.sphereTimeout += 7000;
                    messagesArr.push(new MessageText(`PROTECTION 7 SEC.`, player.x, player.y));
                break;

                default:
                    player.addScores(50, player.x, player.y);
            }
            playSound('se_bonus.mp3');
            return;
        }

        this.draw();
    }
}

class Container extends SpriteSheet {
    constructor(x, y) {
        super('container_64x64px_36frames.png', x, y, 64, 64, 36, 30, Math.random() * _2PI);
        this.speed = 0.05;
    }

    update(dt) {
        moveObject(this, this.speed * dt);

        if (checkObjectVisibility(this) === false) {
            this.isExist = false;
            return;
        }

        player.bulletsArr.forEach( bullet => {
            if (bullet.isExist && getDistance(this, bullet) < this.size) {
                explosionsArr.push(new Explosion(bullet.x, bullet.y, 1));
                bullet.isExist = false;
                this.isExist = false;
                if (Math.random() < 0.75)  {
                    explosionsArr.push(new Explosion(this.x, this.y, 3));
                    addBonus(this.x, this.y);
                } else {
                    explosionsArr.push(new Explosion(this.x, this.y, 2));
                    smokeArr.push(new Smoke(this.x, this.y));
                }
                
            }
        });

        if (this.isExist) this.drawWithAnimation(dt);
    }
}