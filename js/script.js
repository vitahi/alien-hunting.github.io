let canvas, ctx;            //Глобальні змінні для тегу canvas
let width, height;          //Глобальні змінні для ширини і висоти холста
let $startLoad = 0;         //Кількість об'єктів
let $endLoad = 0;           //Кількість завантажених об'єктів
let keyLeft = false;        //кнопка ліво
let keyRight = false;       //кнопка право
let keyUp = false;          //кнопка верх
let keyDown = false;        //кнопка низ
let lastTime;               //Останній час обновлення
let objectImage, bgImage;   //Малюнки гри
let bg;                     //фон
let player = [];            //Масив для гравця та його параметрів
let playerSpeed = 0.2;      //швідкість літака
let keySpace = false;       //Натиснена кнопка пробіл
let lastFire;               //останній вистріл
let bullets = [];           //Снаряди
let bulletSpeed = 0.5;      //Швидкість снарядів
let enemies = [];           //вороги
let enemySpeed = 0.1;       //скорость ворогів
let gameTime = 0;           //час гри
let blastersound;
let gameOver = false;
let explosions = []; //вибухи
let gamePoints = 0;//счет уничтожыных врагов


// функцыя на праверку сталкновений фегур
function collides(x1, y1, w1, h1, x2, y2, w2, h2) {
    if((x1+w1)<=x2||x1>(w2+x2)||(y1+h1)<=y2||y1>(y2+h2)) {
        return false;
    } else {
        return true;
    }
}

//задаємо функції оброботки

function main() {
    clear();                            //очищеня хлдста

    times = Date.now();                 //поточний час
    dt = times - lastTime;              //прошло часу від прошлого кадру

    ctx.fillStyle = bg;                 //визначимо картинку фона
    ctx.fillRect(0 ,0, width, height);  //малюємо фон холста

    if(gameOver) {
        ctx.font = "72px Tahome";
        ctx.fillStyle = "white";
        ctx.fillText("Кінець гри!", 190, 250);
    } else {
        gameTime += dt;//час игры
        drawExplosionss(dt);//рисуемо взрывы
        drawPlayer(dt);                     //малюємо літак
        drawBullet(dt);                     //Малюємо снаряди
        gameTime += dt;
        drawEnemies(dt);                    //малюємо ворогів
        checkColisions();                   //проверка на сталкнавения
        //написи на игравом поле
        ctx.font = "16px Verdana";
        ctx.fillStyle = "yellow";
        time = Math.floor(gameTime/1000);
        gameMin = Math.floor(time/60);
        gameSec = time%60;
        if(gameMin<10) gameMin="0"+gameMin;//если меньше 10 минут дописуем 0 в начале
        if (gameSec<10) gameSec = "0";//если меньше 10 секунд дописуем 0 в начале
        ctx.fillText("Час: "+gameMin+":"+gameSec, 600, 20);
        ctx.fillText("Вбито ворогів: "+gamePoints, 20, 20);
    }

    lastTime = times;                   //записуємо час поточного кадру
    requestAnimationFrame(main);        //повторяємо запуск функції
};

//функція для малювання літака

function drawPlayer(dt) {
    if(keyLeft) {                           //якщо натиснути клавішу ліво
        player.x-=playerSpeed*dt;           //змінюєм положеня літока по вісі Х
        if(player.x<0) {                    //якщо літак виходить за межі холста
            player.x=0;                     //ставим на початок
        }
    }
    if(keyRight) {                          //якщо натиснути клавішу право
        player.x+=playerSpeed*dt;           //змінюєм положеня літока по вісі Х
        if(player.x>(width-player.w)) {     //якщо літак виходить за межі холста
            player.x=width-player.w;        //ставим на початок
        }
    }
    if(keyUp) {                             //якщо натиснути клавішу верх
        player.y-=playerSpeed*dt;           //змінюєм положеня літока по вісі У
        if(player.y<0) {                    //якщо літак виходить за межі холста
            player.y=0;                     //ставим на початок
        }
    }
    if(keyDown) {                           //якщо натиснути клавішу низ
        player.y+=playerSpeed*dt;           //змінюєм положеня літока по вісі У
        if(player.y>(height-player.h)) {    //якщо літак виходить за межі холста
            player.y = height-player.h;     //ставим на початок
        }
    }
    player.action+=1;                       //переходемо на наступню анімацію
    if(player.action==player.count) {       //якщо попередня була остання, тоді переходимо на першу анімацію 
        player.action = 0;
    }

    if(keySpace) { //якщо нажата клавіша пробіл
        if((Date.now()-lastFire)>100) {//якшо якщо прошло більш 0.1 с від попередньої постріла
            let $x = player.x + player.w/2;//цінтер літака по вісі Х
            let $y = player.y + player.h/2;//цінтер літака по вісі У

            bullets.push({//занесеня в масив снарядів переднього снаряду
                x: $x, 
                y:$y, 
                type: "forward", 
                row: 39, 
                col: 0,
                w: 18,
                h: 8
            });
            
            bullets.push({//занесеня в масив снарядів нижнього снаряда
                x: $x,
                y: $y,
                type: "up",
                row: 50,
                col: 0,
                w: 9,
                h: 5
            });

            bullets.push({//занесеня в масив снарядів верхнього снаряду
                x: $x,
                y: $y,
                type: "down",
                row: 60,
                col: 0,
                w: 9,
                h: 5
            });

            lastFire = Date.now();//оновленя часу останього пострілу
        }
    }

    ctx.drawImage(objectImage, (player.action*player.col), player.row, player.w, player.h, player.x, player.y, player.w, player.h);     //малюємо літак з картинки об'єктів
}

function drawBullet(dt) {//функція для малювання снарядів
    for(let i=0;i<bullets.length;i++) {//проходимо по циклу снарядів
        let bullet = bullets[i];//заносимо в тимчасову зміну поточний снаряд з масиву

        switch(bullet.type) {// визначаємо тип снаряду
            case "up": bullet.y -= bulletSpeed*dt;//рухаємо снаряд вверх по вісі У
            break;
            case "down": bullet.y += bulletSpeed*dt;//рухаємо снаряд вниз по вісі У
            break;
            case "forward": bullet.x += bulletSpeed*dt;//рухаємо снаряд вперед по вісі Х
            break;
        }

        //малювання снаряду
        ctx.drawImage(objectImage, bullet.col, bullet.row, bullet.w, bullet.h, bullet.x, bullet.y, bullet.w, bullet.h);

        if(bullet.y<0||bullet.y>height||bullet.x>width) {//якщо снаряд виходитеме за холсту
            bullets.splice(i, 1);//видиляємо снаряд з масиву
            i--;//так як видиляємий снаряд і масив змінився, залишился на тій же позиції
        }
    }
}

function drawEnemies(dt) {//функція для млювання ворогів 
    if(Math.random()<1-Math.pow(.993, gameTime/1000)) {//чи добовляти нових ворогів
        enemies.push({
            x: width,
            y: (Math.random()*(canvas.height-39)),
            row: 78,
            col: 80,
            w: 80,
            h: 39,
            action: 0,
            count: 6
        });//знесемо ворогів у масив
    }
    for(let i=0;i<enemies.length;i++) {//проходимо по циклу масива ворогів
        value = enemies[i];//зносимо в тимчасову змінну поточного ворога з мисиву
        value.x -= enemySpeed*dt;//рухаємо ворогів по вісі Х

        value.action++;//наступня анимація
        if(value.action==value.count) {//якщо анімація останя, переходимо на першу анімацію
            value.action = 0;
        }

        //малюємо ворогів з файлу спрайтів
        ctx.drawImage(objectImage, (value.col*value.action), value.row, value.w, value.h, value.x, value.y, value.w, value.h);

        if(value.x+value.w<0) { //якщо ворог зайшов за холст виделяємо з масиву
            enemies.splice(i, 1);
            i--;
        }
    }
}

function drawExplosionss(dt) {
    for(let i=0;i<explosions.length;i++) {
        value = explosions[i];

        //рисуем взрывы
        ctx.drawImage(objectImage, (value.col*value.action), value.row, value.w, value.h, value.x, value.y, value.w, value.h);

        value.action++;
        if(value.action==value.count) {//если анимацыя была последней 
            enemies.splice(i, 1);//удаляем из масива взрыв
            i--;
        }
    }
}

//функыя проверки сталкновений

function checkColisions() {
    for(let i=0;i<enemies.length;i++) {//цыкл ворога
        if(collides(enemies[i].x, enemies[i].y, enemies[i].w, enemies[i].h, player.x, player.y, player.w, player.h)) {//проверяем игрок сталкнулся с врагом
            gameOverF();//конец игры
            break;//срыв цыкла
        }

        for(let j=0;j<bullets.length;j++) {//цыкл снарядов
            if(collides(enemies[i].x, enemies[i].y, enemies[i].w, enemies[i].h, bullets[j].x, bullets[j].y, bullets[j].w, bullets[j].h)) {//проверка на столкновение снаряда с врагом
                explosions.push({//заносим в масив взрыв
                    x: enemies[i].x,
                    y: enemies[i].y,
                    row: 117,
                    col: 39,
                    w: 39,
                    h: 39,
                    action: 0,
                    count: 13
                });
                gamePoints++;

                enemies.splice(i, 1);//уничтожение врага
                i--;
                bullets.splice(j, 1);//удаление снаряда
                break;//срыв цыкла
            }
        }
    }
}

// функція для очищеня холсту

function clear() {
    ctx.clearRect(0, 0, width, height);
}

function startLoad() {
    $startLoad++;                                   //+1 об'єкт на завантаження

    $startLoad++;                                   //+1 об'єкт на завантаження
    objectImage = new Image();                      //створення малюнку
    objectImage.src = "img/sprites.png";            //вказуємо адрес малюнку
    objectImage.onload = function() {endLoad();};   //завантажуємо малюнок

    $startLoad++;                                   //+1 об'єкт на завантаження
    bgImage = new Image();                          //створення малюнку
    bgImage.src = "img/terrain.png";                //вказуємо адрес малюнку
    bgImage.onload = function() {endLoad();};       //завантажуємо малюнок

    blastersound = new Audio("audio/laser-blast.mp3");
    blastersound.volume = 0.6;

    player.x = 0;           //положеня літака по вісі Х
    player.y = 220;         //положеня літака по вісі У
    player.w = 39;          //ширіна літака
    player.h = 39;          //висота літака
    player.row = 0;         //положеня літака по вісі У на картинці
    player.col = 39;        //ширіна літака на картинці
    player.count = 2;       //кількість анімацій літака
    player.action = 0;      //активна анімація

    endLoad();              //закінчення завантаження
}

//функція для закінчення завантаження даних

function endLoad() {
    $endLoad++;                     //+1 об'єкт завантаження
    if($startLoad==$endLoad) {      //якщо всі об'єкти завантажени
        start();                    //запуск гри
    }
}

//функція підготовки запуску ігри

function start() {
    bg = ctx.createPattern(bgImage, "repeat");      //малювання фону холста
    lastTime = Date.now();                          //час оновлення
    lastFire = Date.now();                          //час вистрілу
    main();                                         // запускаємо функцію оброботки кадрів
}

function gameOverF() {
    gameOver = true;
    $(".submit").show();
}

function restart() {
    gameTime = 0;
    gamePoints = 0;

    bullets = [];
    enemies = [];
    explosions = [];

    player.x = 0;
    player.y = 220;

    $(".submit").hide();
    gameOver = false;
}

let requestAnimationFrame = (function() {           //функція для малювання 60 кадрів в секунду
    return window.requestAnimationFrame||
        window.webkitRequestAnimationFrame||
        window.mozRequestAnimationFrame||
        window.oRequestAnimationFrame||
        window.msRequestAnimationFrame||
        function(callback) {
            window.setTimeout(callback, 1000/60);
        };
})();

$(function() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    width = canvas.width;
    height = canvas.height;

    startLoad();  //запускаємо функцію завантаження данних
    //Робим jquery функцію для визначання зажатої клавіши
    $(window).keydown(function(event) {
        switch(event.keyCode) {//визначаєм яка клавиша натиснута
            case 37: keyLeft = true;
            break;
            case 38: keyUp = true;
            break;
            case 39: keyRight = true;
            break;
            case 40: keyDown = true;
            break;
            case 32: keySpace = true;//пробіл
                blastersound.currentTime = 0;
                blastersound.play();
            break;
        }
    });

    //Робим jquery функцію, для визначення віджатої клавіши
    $(window).keyup(function(event) {
        //console.log(event.keyCode);
        switch(event.keyCode) {//визначаємо яка клавіша натиснута
            case 37: keyLeft = false;
            break;
            case 38: keyUp = false;
            break;
            case 39: keyRight = false;
            break;
            case 40: keyDown = false;
            break;
            case 32: keySpace = false;//пробіл
            break;
        }
    });
});