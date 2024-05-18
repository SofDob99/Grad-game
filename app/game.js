var w = window.innerWidth,
		h = window.innerHeight;

var game = new Phaser.Game(w, h, Phaser.AUTO, 'game',
		{ preload: preload, create: create, update: update, render: render },
		false, // Antialias
		true
	
	);

function preload() {
	var bmd = game.add.bitmapData(100,100);
	bmd.ctx.fillStyle = '#FFA600';
	bmd.ctx.arc(50,50,50, 0, Math.PI * 2);
	bmd.ctx.fill();
	game.cache.addBitmapData('good', bmd);

	var bmd = game.add.bitmapData(100,100);
	bmd.ctx.fillStyle = '#1B73C3';
	bmd.ctx.arc(50,50,50, 0, Math.PI * 2);
	bmd.ctx.fill();
	game.cache.addBitmapData('bad', bmd);
}

var good_objects,
		bad_objects,
		slashes,
		line,
		scoreLabel,
		score = 0,
		points = [];	

var fireRate = 1000;
var nextFire = 0;


function create() {

	game.physics.startSystem(Phaser.Physics.ARCADE);
	game.physics.arcade.gravity.y = 100;

	game.stage.backgroundColor = '#E0E0E0';

	good_objects = createGroup(100, game.cache.getBitmapData('good'));
	bad_objects = createGroup(6, game.cache.getBitmapData('bad'));

	slashes = game.add.graphics(0, 0);
	

	scoreLabel = game.add.text(20,20,'¿El color complementario del morado es?');
	scoreLabel.fill = '#9585FF';

	scoreMessage = game.add.text(20, 80, '', { font: 'bold 30px Arial', fill: '#FF0000' });

	emitter = game.add.emitter(0, 0, 300);	
	emitter.makeParticles('parts');
	emitter.gravity = 300;
	emitter.setYSpeed(-400,400);

	throwObject();

	nextLevelButton = game.add.button(game.world.centerX, game.world.centerY, 'button', goToNextLevel, this, 2, 1, 0);
    nextLevelButton.anchor.setTo(0.5);


    nextLevelButton.width = 900;
    nextLevelButton.height = 100;

    nextLevelButton.tint = '#C683F2';

    // no puedo cambiar la posición del mensaje de siguiente nivel ni el color del boton
    buttonText = game.add.text(nextLevelButton.x, nextLevelButton.y, 'Siguiente Nivel', { font: 'Arial', fontSize: '40px', fill: '#ffffff', margin: '100px' });
    buttonText.anchor.setTo(0.5);buttonText.y += 10;

	nextLevelButton.visible = false;
	buttonText.visible = false;
	
	
}

function createGroup (numItems, sprite) {
	var group = game.add.group();
	group.enableBody = true;
	group.physicsBodyType = Phaser.Physics.ARCADE;
	group.createMultiple(numItems, sprite);
	group.setAll('checkWorldBounds', true);
	group.setAll('outOfBoundsKill', true);
	return group;
}

function throwObject() {
    if (game.time.now > nextFire && good_objects.countDead() > 0 && bad_objects.countDead() > 0) {
        nextFire = game.time.now + fireRate;
        // Lanzar más bolas malas que buenas
        throwGoodObject();
        throwBadObject();
    }	
}

function throwGoodObject() {
    var obj = good_objects.getFirstDead();
    if (obj) { 
        obj.reset(game.world.centerX + Math.random() * 200 - Math.random() * 100, 600);
        obj.anchor.setTo(0.5, 0.5);
        game.physics.arcade.moveToXY(obj, game.world.centerX, game.world.centerY, 530);
    }
}

function throwBadObject() {
    var obj = bad_objects.getFirstDead();
    if (obj) { 
        obj.reset(game.world.centerX + Math.random() * 300 - Math.random() * 100, 600);
        obj.anchor.setTo(0.5, 0.5);
        var randomColor = Phaser.Color.getRandomColor(50, 255, 255);
        obj.tint = randomColor;
        game.physics.arcade.moveToXY(obj, game.world.centerX, game.world.centerY, 690);
    }
}

function update() {
	throwObject();

	points.push({
		x: game.input.x,
		y: game.input.y
	});
	points = points.splice(points.length-10, points.length);
	//game.add.sprite(game.input.x, game.input.y, 'hit');

	if (points.length<1 || points[0].x==0) {
		return;
	}

	slashes.clear();
	slashes.beginFill(0x7300FF);
	slashes.alpha = .9;
	slashes.moveTo(points[0].x, points[0].y);
	for (var i=1; i<points.length; i++) {
		slashes.lineTo(points[i].x, points[i].y);
	} 
	slashes.endFill();

	for(var i = 1; i< points.length; i++) {
		line = new Phaser.Line(points[i].x, points[i].y, points[i-1].x, points[i-1].y);
		game.debug.geom(line);

		good_objects.forEachExists(checkIntersects);
		bad_objects.forEachExists(checkIntersects);
	}
}

var contactPoint = new Phaser.Point(0,0);

function checkIntersects(fruit, callback) {
	var l1 = new Phaser.Line(fruit.body.right - fruit.width, fruit.body.bottom - fruit.height, fruit.body.right, fruit.body.bottom);
	var l2 = new Phaser.Line(fruit.body.right - fruit.width, fruit.body.bottom, fruit.body.right, fruit.body.bottom-fruit.height);
	l2.angle = 90;

	if(Phaser.Line.intersects(line, l1, true) ||
		Phaser.Line.intersects(line, l2, true)) {

		contactPoint.x = game.input.x;
		contactPoint.y = game.input.y;
		var distance = Phaser.Point.distance(contactPoint, new Phaser.Point(fruit.x, fruit.y));
		if (Phaser.Point.distance(contactPoint, new Phaser.Point(fruit.x, fruit.y)) > 110) {
			return;
		}

		if (fruit.parent == good_objects) {
			killFruit(fruit);
		} else {
			resetScore();	
		}
	}

}

function resetScore() {
	var highscore = Math.max(score, localStorage.getItem("highscore"));
	localStorage.setItem("highscore", highscore);

	good_objects.forEachExists(killFruit);
	bad_objects.forEachExists(killFruit);

	score = 0;
	scoreLabel.fill = '#FFFFFF';
	scoreMessage.fill = '#FF0000';
	scoreMessage.text = 'MISIÓN FALLIDA, INTENTALO DE NUEVO\nHigh Score: ' + highscore;
	// Retrieve
}

function render() {
}
function killFruit(fruit) {

    emitter.x = fruit.x;
    emitter.y = fruit.y;
    emitter.start(true, 2000, null, 4);
    
    
    fruit.kill();
    
    
    score++;
    scoreLabel.text = 'Score: ' + score;
    
    //AQUÍ SE CAMBIA EL OBJETIVO A ALCANZAR, PERO PARA PODER VER LA JUGABILIDAD MEJOR LO PONGO A 5

    if (score === 5) {
        showCongratulationMessage();
		nextLevelButton.visible = true;
		buttonText.visible = true;
    }
}

function showCongratulationMessage() {
    var congratulationText = game.add.text(game.world.centerX, game.world.centerY, 'MISIÓN 1 COMPLETADA', { font: 'bold 60px Arial', fill: '#FF9100' });
    congratulationText.anchor.setTo(0.5);
    
    
    game.time.events.add(Phaser.Timer.SECOND * 3, function() {
        congratulationText.destroy(); 
    }, this);
}

function goToNextLevel() {
	window.location.href = 'mision2.html'
}

