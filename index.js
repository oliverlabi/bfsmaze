const gameFieldDOM = document.getElementById('game-field');
const buildBtnContainerDOM = document.getElementById('build')
const buildBtnDOM = buildBtnContainerDOM.getElementsByClassName('build-btn')
const pathDistanceDOM = document.getElementById('path-distance-value');

const fieldHeight = 8;
const fieldWidth = 18;
const emptyChar = '-';
const endChar = 'E';
const fieldChar = 'X';
const pathChar = 'P'
const startChar = 'S';

class Grid {
    constructor(width, height, x, y){
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;

        this.drawGrid();
    }

    drawGrid(){
        for(let i = 0; i < this.height; i++){
            for(let j = 0; j < this.width; j++){
                let currentColumn = document.querySelector('#row' + (i + this.y) + ' #column' + (j + this.x));

                currentColumn.innerHTML = fieldChar;
                fullGameField[i + this.y][j + this.x] = fieldChar;
            }
        }
    }
}

class Graph {
    constructor() {
        this.vertices = [];
        this.adjacent = {};
        this.edges = 0;
    }

    addVertex(v) {
        this.vertices.push(v);
        this.adjacent[v] = [];
    }

    addEdge(v, w) {
        this.adjacent[v].push(w);
        this.edges++;
    }

    BFS(goal, root = this.vertices[0]) {
        let adj = this.adjacent;

        const queue = [];
        queue.push(root);

        const discovered = [];
        discovered[root] = true;

        const predecessors = [];
        predecessors[root] = null;

        const edges = [];
        edges[root] = 0;

        while(queue.length) {
            let v = queue.shift();
            if (v === goal) {
                return {
                    distance: edges[goal],
                    path: this.buildPath(goal, root, predecessors),
                };
            }

            const filteredAdj = Object.entries(adj).filter(e => e[0] === v)[0][1];
            for (let i = 0; i < filteredAdj.length; i++) {
                if (!discovered[filteredAdj[i]]) {
                    discovered[filteredAdj[i]] = true;
                    edges[filteredAdj[i]] = edges[v] + 1;
                    predecessors[filteredAdj[i]] = v;
                    queue.push(filteredAdj[i][0]);
                }
            }
        }

        return false;
    }

    buildPath(goal, root, predecessors) {
        const stack = [];
        stack.push(goal);

        let u = predecessors[goal];

        while(u !== root) {
            stack.push(u);
            u = predecessors[u];
        }

        stack.push(root);

        return stack.reverse().join(',');
    }
}

let fullGameField = Array(fieldHeight).fill(emptyChar).map(()=>Array(fieldWidth).fill(emptyChar));

let pathDistance;
let pathArray;

let graphObj = new Graph();
let adjGraph = {};

let startCoordinates = {
    x: null,
    y: null,
}

let endCoordinates = {
    y: null,
    x: null,
}

let currentActiveButtonChar;

function initialRender(){
    for(let i = 0; i < fieldHeight; i++){
        let gridRow = document.createElement('div');
        gridRow.setAttribute('class', 'fieldRow');
        gridRow.id = 'row' + i;
        for(let j = 0; j < fieldWidth; j++){
            let gridColumn = document.createElement('button');
            gridColumn.setAttribute('class', 'fieldColumn');
            gridColumn.setAttribute('onclick', `handleClickOnGrid(${i}, ${j})`);
            gridColumn.id = 'column' + j;
            gridColumn.innerHTML = emptyChar;
            gridRow.appendChild(gridColumn);
        }
        gameFieldDOM.appendChild(gridRow);
    }
}

function createAdjGraph(){
    for(let i = 0; i < fieldHeight; i++){
        for(let j = 0; j < fieldWidth; j++){
            if(fullGameField[i][j] === fieldChar || fullGameField[i][j] === startChar || fullGameField[i][j] === endChar){
                adjGraph[`${i}-${j}`] = [];
                graphObj.addVertex(`${i}-${j}`);
            }
        }
    }

    Object.keys(adjGraph).forEach(function (key) {
        const iterators = key.split('-');
        const neighbourUp = Object.keys(adjGraph)
            .filter(element =>
                element.split('-')[0] === (parseInt(iterators[0]) - 1).toString()
                && element.split('-')[1] === iterators[1]);
        const neighbourDown = Object.keys(adjGraph)
            .filter(element =>
                element.split('-')[0] === (parseInt(iterators[0]) + 1).toString()
                && element.split('-')[1] === iterators[1]);
        const neighbourLeft = Object.keys(adjGraph)
            .filter(element =>
                element.split('-')[0] === iterators[0]
                && element.split('-')[1] === (parseInt(iterators[1]) - 1).toString());
        const neighbourRight = Object.keys(adjGraph)
            .filter(element =>
                element.split('-')[0] === iterators[0]
                && element.split('-')[1] === (parseInt(iterators[1]) + 1).toString());

        if(neighbourUp.length !== 0){
            graphObj.addEdge(key, neighbourUp);
        }

        if(neighbourDown.length !== 0){
            graphObj.addEdge(key, neighbourDown);
        }

        if(neighbourLeft.length !== 0){
            graphObj.addEdge(key, neighbourLeft);
        }

        if(neighbourRight.length !== 0){
            graphObj.addEdge(key, neighbourRight);
        }
    })
}

function handleBuildBtn(value){
    for (let i = 0; i < buildBtnDOM.length; i++) {
        let current = document.getElementsByClassName("active");

        if (current.length > 0) {
            current[0].className = current[0].className.replace(" active", "");
        }

        buildBtnDOM[value].className += " active";
    }

    switch(value){
        case 0:
            currentActiveButtonChar = fieldChar;
            return;
        case 1:
            currentActiveButtonChar = startChar;
            return;
        case 2:
            currentActiveButtonChar = endChar;
            return;
        case 3:
            currentActiveButtonChar = emptyChar;
            return;
    }
}

function removePrevSameChar(char, x, y) {
    if(y && x){
        const currentSelection = document.querySelector('#row' + x + ' #column' + y);
        if(currentSelection.innerHTML === char){
            currentSelection.innerHTML = fieldChar;
        }
    }
}

function handleClickOnGrid(x, y){
    clearPreviousPath();
    if(currentActiveButtonChar){
        switch(currentActiveButtonChar){
            case startChar:
                removePrevSameChar(startChar, startCoordinates.x, startCoordinates.y);
                startCoordinates = {
                    x: x,
                    y: y,
                }
                break;
            case endChar:
                removePrevSameChar(endChar, endCoordinates.x, endCoordinates.y);
                endCoordinates = {
                    x: x,
                    y: y,
                }
                break;
        }

        const currentSelection = document.querySelector('#row' + x + ' #column' + y);
        currentSelection.innerHTML = currentActiveButtonChar;
        fullGameField[x][y] = currentActiveButtonChar;
    }
}

function drawMap(){
    new Grid(16, 6, 1, 1);
}

function clearPreviousPath() {
    if(pathArray){
        pathDistance = 0;
        pathDistanceDOM.innerHTML = pathDistance;
        pathArray.forEach((path) => {
            const iterators = path.split('-');
            const pathSpotOnDOM = document.querySelector('#row' + iterators[0] + ' #column' + iterators[1]);
            if(pathSpotOnDOM.innerHTML !== fieldChar && pathSpotOnDOM.innerHTML !== endChar && pathSpotOnDOM.innerHTML !== emptyChar && pathSpotOnDOM.innerHTML !== startChar){
                pathSpotOnDOM.innerHTML = fieldChar;
            }
        })
    }
}

function handleBFSBtnClick(){
    const graphObjExists = graphObj.vertices.length > 0;
    if(graphObjExists){
        graphObj = new Graph();
        adjGraph = {};
    }

    createAdjGraph();
    let bfsPath;

    if(startCoordinates.x && startCoordinates.y){
        bfsPath = graphObj.BFS(endCoordinates.x + '-' + endCoordinates.y ,startCoordinates.x + '-' + startCoordinates.y);
    }

    if(bfsPath){
        drawPath(bfsPath);
    }
}

function drawPath(bfsPath){
    pathDistance = bfsPath.distance;
    pathDistanceDOM.innerHTML = pathDistance;
    pathArray = bfsPath.path.split(',');
    pathArray.pop();
    pathArray.shift();
    pathArray.forEach((path) => {
        const iterators = path.split('-');
        const pathSpotOnDOM = document.querySelector('#row' + iterators[0] + ' #column' + iterators[1]);
        pathSpotOnDOM.innerHTML = pathChar;
    })
}

function init(){
    initialRender();
    drawMap();
}