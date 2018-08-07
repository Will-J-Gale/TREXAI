const TOTAL_TREX = 300;
let screenStart = 143;
let screenStop = 505
let width = window.innerWidth;
let height = screenStop - screenStart;
let floor = height - 12
//const TOTAL_TREX = 1

//Trex Variables
let TREX_HEIGHT = 55;
let TREX_WIDTH = 50;
let TREX_LIFT = -50;
let TREX_GRAVITY = 1.5;
let TREX_X = 55;

//Obstacle Variables
let OBSTACLE_SPEED = 10;
let MIN_OBSTACLE_SPEED = 10;
let MAX_OBSTACLE_SPEED = 20;
let SPEED_INCRAMENT = 0.005;
let SPAWN_TIME = 90
let MIN_SPAWN_TIME = 65;
let MAX_SPAWN_TIME = 90;
let GAP_MIN = 0;
let GAP_MAX = 200;

//Obstacle Sizes
let SINGLE_BIG = {
    width: 30,
    height: 62
}
let SINGLE_SMALL = {
    width: 20,
    height: 43
}
let DOUBLE_BIG = {
    width: 60,
    height: 62
}
let DOUBLE_SMALL = {
    width: 40,
    height: 43,
}
let TRIPLE_BIG = {
    width: 83,
    height: 55,
}
let TRIPLE_SMALL = {
    width: 60,
    height: 43,
}
let BIRD_LOW = {
    width: 54,
    height: 34,
    yPos: height * 0.8
}
let BIRD_MEDIUM = {
    width: 54,
    height: 34,
    yPos: height * 0.63
}
let BIRD_HIGH = {
    width: 54,
    height: 34,
    yPos: height * 0.44
}

let GRAVITY;
let trexes = [];
let savedTrexes = [];
let obstacles = [];
let maxObs

let slider;
let counter = 0;
let bestTrex;
let averageBestScore = 0;

let generation = 1;
let canvas;
let dinoImage;
let dinoIndex = 0

function showText()
{
    text("Generation: " + generation, width * 0.94, height * 0.05);
}
function setup()
{
    canvas = createCanvas(width, height);
    canvas.position(0, screenStart)
    GRAVITY = createVector(0, 1);
    slider = createSlider(1, 100, 1)
    bestTrex = new TREX();
    resetGame();

    for(let i = 0; i < TOTAL_TREX; i++)
    {
        trexes.push(new TREX(TREX_X, height - 200));
    }
}
function draw()
{
    background(0);

    for(let n = 0; n < slider.value(); n++)
    {
        for (let i =  obstacles.length - 1; i >= 0; i--)
        {
            obstacles[i].update()

            if(obstacles[i].position.x < 0 - obstacles[i].width)
               obstacles.splice(i, 1);
        }

        for(let j =  trexes.length - 1; j >= 0; j--)
        {
            let trex = trexes[j]
            trex.update(obstacles);

            if(trex.dead)
            {   
                trex.score = counter * counter;
                savedTrexes.push(trex);
                trexes.splice(j, 1);
            }
        }

        if(trexes.length == 0 )
        {
            resetGame();
            nextGeneration();
            generation += 1;
        }

        if(OBSTACLE_SPEED < MAX_OBSTACLE_SPEED)
            OBSTACLE_SPEED += SPEED_INCRAMENT;

        SPAWN_TIME = round(map(
            OBSTACLE_SPEED, 
            MIN_OBSTACLE_SPEED, 
            MAX_OBSTACLE_SPEED,
            MAX_SPAWN_TIME, MIN_SPAWN_TIME))

        counter++;
        
        if(counter % SPAWN_TIME == 0)
            obstacles.push(new Obstacle(OBSTACLE_SPEED))
    }

    for(let trex of trexes)
    {
        trex.draw();
    }

    for (let obstacle of obstacles)
    {
        obstacle.show()
    }

    showText()
}

function resetGame()
{
    counter = 0;
    obstacles = [];
    OBSTACLE_SPEED = MIN_OBSTACLE_SPEED;
    SPAWN_TIME = MAX_SPAWN_TIME;
    obstacles.push(new Obstacle(OBSTACLE_SPEED))
}

function forceRestart()
{
    for(let trex of trexes)
    {
        savedTrexes.push(trex);
    }

    trexes = [];
    resetGame();
    nextGeneration();
}