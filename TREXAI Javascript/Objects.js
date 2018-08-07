class TREX
{
    constructor(x = 0, y = 0, brain)
    {
        this.position = createVector(x, y);
        this.velocity = createVector(0,0);

        this.height = TREX_HEIGHT;
        this.width = TREX_WIDTH;
        this.lift = TREX_LIFT;
        this.gravity = TREX_GRAVITY;
        this.score = 0;
        this.fitness = 0;

        if(brain instanceof NeuralNetwork)
            this.brain = brain.copy();
        else
            this.brain = new NeuralNetwork(3, 7, 1);
        
    }
    update(obstacles)
    {
        this.score++;

        this.velocity.y += this.gravity;
        this.velocity.y *= 0.9;
        this.position.add(this.velocity);

        this.checkBounds();

        if(this.hits(obstacles))
            this.dead = true;

        this.think(this.getClosestObstacle(obstacles));
    }
    checkBounds()
    {
        if(this.position.y > floor - this.height)
        {
            this.velocity.set(0, 0);
            this.position.y = floor - this.height;
            this.jumping = false
        }

        if(this.position.y < 0)
        {
            this.velocity.set(0, 0);
            this.position.y = 0
        }
    }
    jump()
    {
        if(!this.jumping)
        {
            this.velocity.y = this.lift;
            this.jumping = true;
        }
    }
    draw()
    {
        fill(255, 0, 0);
        rectMode(CENTER)
        rect(this.position.x, this.position.y, this.width * 2, this.height * 2);
    }
    think(closestObstacle)
    {
        if(closestObstacle.distance == Infinity)
            return;
            
        let distance = closestObstacle.distance;
        let posX = closestObstacle.obstacle.position.x / width;
        let posY = closestObstacle.obstacle.position.y / height;
        posX = min(1, posX)
        let action = this.brain.predict([posX, posY, distance])

        if(action[0] > 0.5)
            this.jump();
    }
    getClosestObstacle(obstacles)
    {
        let minDistance = Infinity;
        let closestObstacle = null;
        for(let obstacle of obstacles)
        {
            let distance = obstacle.position.x - this.position.x;

            if(distance < minDistance && distance > 0)
            {
                minDistance = distance
                closestObstacle = obstacle;
            }
        }
        
        minDistance = minDistance / width

        return {obstacle: closestObstacle, distance: minDistance};
    }
    hits(obstacles)
    {
        let minX = this.position.x - this.width;
        let maxX = this.position.x + this.width;
        let minY = this.position.y + this.height;
        let maxY = this.position.y - this.height;

        for(let i = 0; i < obstacles.length; i++)
        {
            let obstacle = obstacles[i];
            let oMinX = obstacle.position.x - obstacle.width;
            let oMaxX = obstacle.position.x + obstacle.width;
            let oMinY = obstacle.position.y + obstacle.height;
            let oMaxY = obstacle.position.y - obstacle.height; 

            if(minX < oMaxX && maxX > oMinX)
            {  
                if(minY > oMaxY && maxY < oMinY)
                {
                    return true;
                }
            }
        }

        return false;
    }
    mutate()
    {
        this.brain.mutate(0.1);
    }
}

class Obstacle
{
    constructor(speed = OBSTACLE_SPEED)
    {
        let r1 = round(random(0, 2))
        let r2 = round(random(0, 5))
        
        if(r1 >= 1)
        {
            switch(r2)
            {
                case 0:
                    this.width = SINGLE_BIG.width;
                    this.height = SINGLE_BIG.height;
                    break;
                case 1://
                    this.width = SINGLE_SMALL.width;
                    this.height = SINGLE_SMALL.height;
                    break;
                case 2://Group of three
                    this.width = DOUBLE_BIG.width;
                    this.height = DOUBLE_BIG.height;
                    break;
                case 3:
                    this.width = DOUBLE_SMALL.width;
                    this.height = DOUBLE_SMALL.height;
                    break;
                case 4:
                    this.width = TRIPLE_BIG.width;
                    this.height = TRIPLE_BIG.height;
                    break;
                case 5:
                    this.width = TRIPLE_SMALL.width;
                    this.height = TRIPLE_SMALL.height;
                    break;
            }

            this.startY = floor - this.height;
        }
        else
        {
            let r3 = round(random(0, 2))

            this.width = BIRD_LOW.width;
            this.height = BIRD_LOW.height;
            
            switch(r3)
            {
                case 0:
                    this.startY = BIRD_LOW.yPos
                    break;
                case 1:
                    this.startY = BIRD_MEDIUM.yPos
                    break;
                case 2: 
                    this.startY = BIRD_HIGH.yPos
                    break
            }
        }

        this.startX = width + round(random(GAP_MIN, GAP_MAX));
        this.position = createVector(this.startX, this.startY);

        this.speed = speed;
        this.maxSpeed = 20;
        this.highlight = false;
    }
    show()
    {
        if(this.highlight)
            fill(255, 0, 0);
        else
            fill(255);

        rectMode(CENTER)
        let pos = this.position;
        rect(this.position.x, this.position.y, this.width * 2, this.height * 2);
    }
    update()
    {
        this.position.x -= this.speed;
    }
    offScreen()
    {
        return (this.x < 0 - this.w)
    }
    hits(trex)
    {
        let tMinX = trex.position.x - trex.width;
        let tMaxX = trex.position.x + trex.width;
        let tMinY = trex.position.y + trex.height;
        let tMaxY = trex.position.y - trex.height;
        
        let minX = this.position.x - this.width;
        let maxX = this.position.x + this.width;
        let minY = this.position.y + this.height;
        let maxY = this.position.y - this.height;

        if(minX < tMaxX && maxX > tMinX)
        {       
            if(true)
            {
                this.highlight = true;
                return true;
            }
        }

        this.highlight = false;
        return false;
    }
}

function nextGeneration()
{
    calculateFitness();
    for(let i = 0; i < TOTAL_TREX; i++)
    {
        trexes.push(pickOne());
    }
    savedTrexes = [];
}
function calculateFitness()
{
    let sum = 0;
    let highestFitness = 0;
    let currentBest = null;

    for(let trex of savedTrexes)
    {
        sum += trex.score;
        if(trex.score > highestFitness)
        {
            highestFitness = trex.score;
            currentBest = trex;
        }
    }
    if(currentBest.score > bestTrex.score)
        bestTrex = currentBest;

    for(let trex of savedTrexes)
    {
        trex.fitness = trex.score / sum;
        //console.log("Fitness: " + trex.fitness)
    }
}
function pickOne()
{
    let index = 0;
    let r = random(1);

    while(r > 0)
    {
        r = r - savedTrexes[index].fitness;
        index++;
    }

    index--;

    let trex = savedTrexes[index];
    let child = new TREX(TREX_X, height/2, trex.brain);
    child.mutate();

    return child;
}

