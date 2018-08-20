


function Game(callback) {

    const state = {
        direction : {
            x:Math.round((Math.random())) === 0 ? 2 : -2,
            y:Math.round((Math.random())) === 0 ? 1 : -1,
        },
        x: 300,
        y: 200,
        left : 150,
        right : 150,
        intervals : []
    };
    
    this.getState = () => {
        let {left, right, x, y} = state;
        return {left, right, x, y};
    };
    
    this.stop = who => {
        for (let i in state.intervals)
            clearInterval(state.intervals[i]);
        state.intervals = [];
        callback(who);
    };
    
    const paddleIncrement = () => {
        let increment = 20 + state.intervals.length * 3;
        increment = increment > 80 ? 80 : increment;
        return increment;
    };
    
    this.moveRightPaddle = string => {
        if (string === 'ArrowUp')
            state.right = state.right + paddleIncrement();
        else if (state.right > 0)
            state.right = state.right - paddleIncrement();
        state.right = state.right < 0 ? 0 : state.right > 300 ? 300 : state.right;
    };
    
    this.moveLeftPaddle = string => {
        if (string === 'ArrowUp')
            state.left = state.left + paddleIncrement();
        else if (state.left > 0)
            state.left = state.left - paddleIncrement();
        state.left = state.left < 0 ? 0 : state.left > 300 ? 300 : state.left;
        
    };
    
    const flipX = () => {
        state.direction.x = state.direction.x * -1;
        state.intervals.push(setInterval(moveBall,80));
    };
    
    const moveBall = () => {
        state.x += state.direction.x;
        state.y += state.direction.y;
    
        if (state.y < 0) {
            state.direction.y = state.direction.y * -1;
            state.y = state.direction.y;
        } else if (state.y > 400) {
            state.direction.y = state.direction.y * -1;
            state.y = 400 + state.direction.y;
        }
        if (state.x < 0) {
            if (state.y < state.left - 13 || state.y > state.left + 114)
                this.stop('left');
            else {
                let spot = state.y - state.left;
                state.direction.y = spot < 15 ? -3 : spot > 98 ? 3 : state.direction.y > 0 ? 1 : -1;
                flipX();
            }
        }
        if (state.x > 600) {
            if (state.y < state.right - 13 || state.y > state.right + 114)
                this.stop('right');
            else {
                let spot = state.y - state.right;
                state.direction.y = spot < 15 ? -3 : spot > 98 ? 3 : state.direction.y > 0 ? 1 : -1;
                flipX();
            }
        }
    };
    
    this.start = () => state.intervals.push(setInterval(moveBall,40));
    
}



module.exports = Game;
