class Controller{
  constructor(v,m) {
    this.view = v;
    this.model = m;
    this.view.bindRangePicker(this.rangePickerHandler.bind(this));
    this.view.bindVisualizeButton(this.visualizeHandler.bind(this));
    this.view.bindOnPointChanged(this.pointChangedHandler.bind(this));
    this.view.bindOnWallSet(this.wallSetHandler.bind(this));
    this.view.bindOnWeightSet(this.weightSetHandler.bind(this));
    this.view.bindClearPathButton();
    this.view.bindClearBoardButton(this.clearBoardHandler.bind(this));
    this.view.bindRecursiveMazeButton(this.recuresiveMazeHandler.bind(this));
    this.view.bindRandomMazeButton(this.randomMazeHandler.bind(this));
    this.model.bindOnSizeChanged(this.sizeChangedHandler.bind(this));
    this.model.bindOnPathBuilt(this.pathBuiltHandler.bind(this));
    this.model.bindOnMazeBuilt(this.MazeBuiltHandler.bind(this));
    this.sizeChangedHandler(this.model.size, this.model.start, this.model.finish)
  }

  rangePickerHandler(size){
    this.model.changeGrid(size)
  }

  sizeChangedHandler(size, start, finish, pointChangedHandler){
    this.view.drawTable(size, start, finish)
  }

  clearBoardHandler(){
    this.model.changeGrid(this.model.size)
  }

  cellHadler(cell){
    this.model.setPoint(cell)
  }

  pathBuiltHandler(points,shortestPath){
    this.view.drawPath(points,'visited',shortestPath,'onPath')
  }

  visualizeHandler(){
    this.model.visualize(this.view.algoPicker.value)
  }

  pointChangedHandler(newPoint,oldPoint){
    this.model.changePoints(newPoint,oldPoint)
  }

  wallSetHandler(point,set){
    this.model.setWall(point,set)
  }

  weightSetHandler(point,set){
    this.model.setWeight(point,set)
  }

  recuresiveMazeHandler(){
    this.model.buildRecursiveMaze()
  }

  randomMazeHandler(){
    this.model.buildRandomMaze()
  }

  MazeBuiltHandler(points){
    this.view.drawPath(points,'wall')
  }

}



class Model {
  constructor() {
    this.size = 25;
    this.start = [12,12];
    this.finish = [12,37 ];
    this.walls = new Set()
    this.weights = new Set()
  }

  changeGrid(size,newPoint,oldPoint) {
    this.size = size;
    this.start = [Math.floor(this.size/2),Math.floor(this.size/4*2)]
    this.finish = [Math.floor(this.size/2),Math.floor(this.size/4*6)]
    this.walls = new Set()
    this.weights = new Set()

    this.onSizeChanged(this.size, this.start, this.finish)
  }

  changePoints(newPoint,oldPoint){
    oldPoint = oldPoint.split(',')
    newPoint = newPoint.split(',')
    if (this.start[0] == parseInt(oldPoint[0]) && this.start[1] == parseInt(oldPoint[1])) {
      this.start[0] = parseInt(newPoint[0])
      this.start[1] = parseInt(newPoint[1])
    } else {
      this.finish[0] = parseInt(newPoint[0])
      this.finish[1] = parseInt(newPoint[1])
    }
  }


  bindOnSizeChanged(callback){
    this.onSizeChanged = callback
  }

  bindOnPathBuilt(callback){
    this.onPathBuilt = callback
  }

  bindOnMazeBuilt(callback){
    this.onMaseBuilt = callback
  }

  setWall(point,set){
    if (set) this.walls.add('[' + point + ']')
    else this.walls.delete('[' + point + ']')
  }

  setWeight(point,set){
    if (set) this.weights.add('[' + point + ']')
    else this.weights.delete('[' + point + ']')
  }

  buildRandomMaze(){
    this.walls = new Set()
    var points = []
    for (var i = 0; i < this.size*(this.size*2-1)/4; i++) {
      var y = (Math.floor(Math.random() * this.size))
      var x = (Math.floor(Math.random() * (this.size*2)))
      if (y==this.start[0] && x == this.start[1]) continue
      if (y==this.finish[0] && x == this.finish[1]) continue
      points.push([y,x])
      this.walls.add(JSON.stringify([y,x]))
    }
    this.onMaseBuilt(points)
  }

  buildRecursiveMaze(){
    this.walls = new Set()
    var upperLeft = [0,0]
    var bottomRight = [this.size-1, this.size*2-1]
    var start = this.start
    var finish = this.finish
    var points = []
    var holes = new Set()
    function recDiv([y1,x1],[y2,x2]){
      if  ((x2-x1)<2 || (y2-y1)<2) return
      if ((x2-x1)>(y2-y1)){
        var divisor = (Math.floor(Math.random() * (x2 - x1 - 1 )) + x1 + 1)
        var it = 0
        while (holes.has(JSON.stringify([y1-1,divisor])) || holes.has(JSON.stringify([y2+1,divisor]))) {
          it++
          divisor = (Math.floor(Math.random() * (x2 - x1 - 1 )) + x1 + 1)
          if (it>100) {
            console.log([y1-1,divisor], [y2+1,divisor])
            console.log("I tried")
            return
          }
        }
        var hole = Math.floor(Math.random() * (y2 - y1 + 1)) + y1;
        holes.add(JSON.stringify([hole,divisor]))
        for (var i = y1; i < y2+1; i++) {
          if (i==start[0] && divisor == start[1]) continue
          if (i==finish[0] && divisor == finish[1]) continue
          if (i!=hole) points.push([i,divisor])
        }
        recDiv([y1,x1],[y2,divisor-1])
        recDiv([y1,divisor+1],[y2,x2])
      } else {
        var divisor = (Math.floor(Math.random() * (y2 - y1 - 1)) + y1 + 1)
        var it = 0
        while (holes.has(JSON.stringify([divisor,x1-1])) || holes.has(JSON.stringify([divisor,x2+1]))) {
            it++
            divisor = (Math.floor(Math.random() * (y2 - y1 - 1 )) + y1 + 1)
            if (it>100) {
              console.log("I tried")
              return
            }
        }
        var hole = Math.floor(Math.random() * (x2 - x1 + 1)) + x1;
        holes.add(JSON.stringify([divisor,hole]))
        for (var i = x1; i < x2+1; i++) {
          if (divisor==start[0] && i == start[1]) continue
          if (divisor==finish[0] && i == finish[1]) continue
          if (i!=hole) points.push([divisor,i])
        }
        recDiv([y1,x1],[divisor-1,x2])
        recDiv([divisor+1,x1],[y2,x2])
      }
    }

    recDiv(upperLeft,bottomRight)
    points.forEach(item => this.walls.add(JSON.stringify(item)))
    this.onMaseBuilt(points)
  }

  _bfs(){
    var points = []
    var stack = [this.start]
    var directions = [[0,1],[1,0],[-1,0],[0,-1]]
    var finish = this.finish
    var size = this.size
    var visited = new Set()
    var parentNode = {}
    var shortestPath = []
    var newPoint = []
    var walls = this.walls
    visited.add(JSON.stringify(this.start))
    function bfs() {
      while (stack.length>0) {
        var point = stack.shift()
        if (point[0] == finish[0] && point[1] == finish[1]) break
        points.push(point)
        for (var i = 0; i < directions.length; i++) {
          newPoint = [point[0] + directions[i][0],point[1]+directions[i][1]]
          if (newPoint[0] < 0 || newPoint[0] >= size || newPoint[1] < 0 || newPoint[1] >= size*2 || visited.has(JSON.stringify(newPoint) )) {
            continue
          } else {
            if (walls.has(JSON.stringify(newPoint))) continue
            stack.push(newPoint)
            visited.add(JSON.stringify(newPoint))
            parentNode[JSON.stringify(newPoint)] = JSON.stringify(point)
          }
        }
      }
    }
    bfs()
    while (parentNode[JSON.stringify(finish)]) {
      var point = JSON.parse(parentNode[JSON.stringify(finish)])
      shortestPath.push(point)
      finish = point
    }
    shortestPath.reverse()
    return [points,shortestPath]
  }
  _dfs(){
    var points = []
    var stack = [this.start]
    var directions = [[0,1],[1,0],[-1,0],[0,-1]]
    var finish = this.finish
    var size = this.size
    var visited = new Set()
    var parentNode = {}
    var shortestPath = []
    var newPoint = []
    var walls = this.walls
    var found = false
    function dfs(point,parent) {
      if (newPoint[0] < 0 || newPoint[0] >= size || newPoint[1] < 0 || newPoint[1] >= size*2) {
        return
      }
      if (visited.has(JSON.stringify(point)) || walls.has(JSON.stringify(point))) return
      if (parent){
        parentNode[JSON.stringify(point)] = JSON.stringify(parent)
      }
      if (point[0] == finish[0] && point[1] == finish[1]) {
        found = true
        return
      }
      if (found) return
      visited.add(JSON.stringify(point))

      points.push(point)
      for (var i = 0; i < directions.length; i++) {
        newPoint = [point[0] + directions[i][0],point[1]+directions[i][1]]
        dfs(newPoint, point)
      }
    }
    dfs(this.start)
    while (parentNode[JSON.stringify(finish)]) {
      var point = JSON.parse(parentNode[JSON.stringify(finish)])
      shortestPath.push(point)
      finish = point
    }
    shortestPath.reverse()
    return [points,shortestPath]
  }

  _astar(){
    var points = []
    var stack = [[this.start,0,0]]
    var directions = [[0,1],[1,0],[-1,0],[0,-1]]
    var finish = this.finish
    var size = this.size
    var visited = new Set()
    var parentNode = {}
    var shortestPath = []
    var newPoint = []
    var walls = this.walls
    var weights = this.weights
    visited.add(JSON.stringify(this.start))

    function heuristics(point, finish) {
      return Math.abs(point[0]-finish[0])+Math.abs(point[1]-finish[1])
    }

    function findMin(stack){
      var minIndex = 0
      var min = stack[0][1] + stack[0][2]
      for (var i = 0; i < stack.length; i++) {
        if (stack[i][1]+ stack[i][2]<min) {
          min = stack[i][1]+stack[i][2]
          minIndex = i
        }
      }
      return minIndex
    }

    function astar() {
      while (stack.length>0) {
        var min = findMin(stack)
        var point = stack[min][0]
        var weight = stack[min][1]
        stack.splice(min,1)


        if (point[0] == finish[0] && point[1] == finish[1]) break
        points.push(point)
        for (var i = 0; i < directions.length; i++) {
          newPoint = [point[0] + directions[i][0],point[1]+directions[i][1]]
          if (newPoint[0] < 0 || newPoint[0] >= size || newPoint[1] < 0 || newPoint[1] >= size*2 || visited.has(JSON.stringify(newPoint) )) {
            continue
          } else {
            if (walls.has(JSON.stringify(newPoint))) continue
            if (weights.has(JSON.stringify(newPoint))){
              stack.unshift([newPoint,weight+15,heuristics(newPoint,finish)])
            } else {
              stack.unshift([newPoint,weight+1,heuristics(newPoint,finish)])
            }
            visited.add(JSON.stringify(newPoint))
            parentNode[JSON.stringify(newPoint)] = JSON.stringify(point)
          }
        }
      }
    }

    astar()
    while (parentNode[JSON.stringify(finish)]) {
      var point = JSON.parse(parentNode[JSON.stringify(finish)])
      shortestPath.push(point)
      finish = point
    }
    shortestPath.reverse()

    return [points,shortestPath]
  }

  _djikstra(){
    var points = []
    var stack = [[this.start,0]]
    var directions = [[0,1],[1,0],[-1,0],[0,-1]]
    var finish = this.finish
    var size = this.size
    var visited = new Set()
    var parentNode = {}
    var shortestPath = []
    var newPoint = []
    var walls = this.walls
    var weights = this.weights
    visited.add(JSON.stringify(this.start))


    function findMin(stack){
      var minIndex = 0
      var min = stack[0][1]
      for (var i = 0; i < stack.length; i++) {
        if (stack[i][1]<min) {
          min = stack[i][1]
          minIndex = i
        }
      }
      return minIndex
    }

    function djikstra() {
      while (stack.length>0) {
        var min = findMin(stack)
        var point = stack[min][0]
        var weight = stack[min][1]
        stack.splice(min,1)
        if (point[0] == finish[0] && point[1] == finish[1]) break
        points.push(point)
        for (var i = 0; i < directions.length; i++) {
          newPoint = [point[0] + directions[i][0],point[1]+directions[i][1]]
          if (newPoint[0] < 0 || newPoint[0] >= size || newPoint[1] < 0 || newPoint[1] >= size*2 || visited.has(JSON.stringify(newPoint) )) {
            continue
          } else {
            if (walls.has(JSON.stringify(newPoint))) continue
            if (weights.has(JSON.stringify(newPoint))){
              stack.push([newPoint,weight+15])
            } else {
              stack.push([newPoint,weight+1])
            }
            visited.add(JSON.stringify(newPoint))
            parentNode[JSON.stringify(newPoint)] = JSON.stringify(point)
          }
        }
      }
    }

    djikstra()
    while (parentNode[JSON.stringify(finish)]) {
      var point = JSON.parse(parentNode[JSON.stringify(finish)])
      shortestPath.push(point)
      finish = point
    }
    shortestPath.reverse()

    return [points,shortestPath]
  }

  _random(){
    var points = []
    var stack = [[this.start,0]]
    var directions = [[0,1],[1,0],[-1,0],[0,-1]]
    var finish = this.finish
    var size = this.size
    var visited = new Set()
    var parentNode = {}
    var shortestPath = []
    var newPoint = []
    var walls = this.walls
    var weights = this.weights
    visited.add(JSON.stringify(this.start))


    function findMin(stack){
      var minIndex = 0
      var min = stack[0][1]
      for (var i = 0; i < stack.length; i++) {
        if (stack[i][1]<min) {
          min = stack[i][1]
          minIndex = i
        }
      }
      return minIndex
    }

    function random() {
      while (stack.length>0) {
        var min = findMin(stack)
        var point = stack[min][0]
        var weight = stack[min][1]
        stack.splice(min,1)
        if (point[0] == finish[0] && point[1] == finish[1]) break
        points.push(point)
        for (var i = 0; i < directions.length; i++) {
          newPoint = [point[0] + directions[i][0],point[1]+directions[i][1]]
          if (newPoint[0] < 0 || newPoint[0] >= size || newPoint[1] < 0 || newPoint[1] >= size*2 || visited.has(JSON.stringify(newPoint) )) {
            continue
          } else {
            if (walls.has(JSON.stringify(newPoint))) continue
            var randWeight = Math.floor(Math.random()*1000)
            stack.push([newPoint,randWeight])
            visited.add(JSON.stringify(newPoint))
            parentNode[JSON.stringify(newPoint)] = JSON.stringify(point)
          }
        }
      }
    }

    random()
    while (parentNode[JSON.stringify(finish)]) {
      var point = JSON.parse(parentNode[JSON.stringify(finish)])
      shortestPath.push(point)
      finish = point
    }
    shortestPath.reverse()

    return [points,shortestPath]
  }

  visualize(algo){
    switch (algo) {
      case 'bfs':
        var results = this._bfs()
        break;
      case 'dfs':
          var results = this._dfs()
          break;
      case 'astar':
          var results = this._astar()
          break;
      case 'djikstra':
          var results = this._djikstra()
          break;
      case 'random':
          var results = this._random()
          break;
      default:
        var results = this._bfs()
    }

    var visited = results[0]
    var shortestPath = results[1]
    this.onPathBuilt(visited, shortestPath)
  }
}


class View {
  constructor() {
    this.app = this.getElement('root')
    this.grid = this.createElement('table', 'gridTable')
    this.rangePicker = this.getElement('rangePicker')
    this.algoPicker = this.getElement('algoPicker')
    this.visualizeButton = this.getElement('visualizeButton')
    this.clearBoardButton = this.getElement('clearBoard')
    this.clearPathButton = this.getElement('clearPath')
    this.recuresiveMazeButton = this.getElement('recuresiveMaze')
    this.randomMazeButton = this.getElement('randomMaze')
    this.app.append(this.grid)
  }

  getElement(id) {
    return document.getElementById(id)
  }
  createElement(tag, className) {
    var element = document.createElement(tag)
    for (var i = 1; i < arguments.length; i++) {
      element.classList.add(arguments[i])
    }
    return element
  }

  bindRangePicker(handler) {
    this.rangePicker.addEventListener('input', event => {
      handler(event.target.value)
    });
  };

  bindVisualizeButton(handler) {
    this.visualizeButton.addEventListener('click', event => {
      handler(event)
    })
  }

  bindClearBoardButton (handler) {
    this.clearBoardButton.addEventListener('click', event => {
      handler(event)
    })
  }

  bindClearPathButton () {
    this.clearPathButton.addEventListener('click', event => {
      this._clearTable()
    })
  }


  bindRecursiveMazeButton(handler) {
    this.recuresiveMazeButton.addEventListener('click', event => {
      this._clearTable(true)
      handler(event)
    })
  }

  bindRandomMazeButton(handler) {
    this.randomMazeButton.addEventListener('click', event => {
      this._clearTable(true)
      handler(event)
    })
  }


  bindOnPointChanged(callback) {
    this.onPointChanged = callback
  }

  bindOnWallSet(callback) {
    this.onWallSet = callback
  }

  bindOnWeightSet(callback) {
    this.onWeightSet = callback
  }

  _initCellStartLocalEventListener(cell) {

      cell.addEventListener('dragstart', event => {
        event.dataTransfer.setData("text", event.currentTarget.id)
        this._clearTable()
      })
    }

  _initCellLocalEventListener(cell) {
      cell.addEventListener('dragover', event => {
        event.preventDefault()
      })
      cell.addEventListener('dragenter', event => {
        event.preventDefault();
        cell.setAttribute('class','onDrag')
      })
      cell.addEventListener('dragleave', event => {
        event.preventDefault();
        cell.removeAttribute('class','onDrag')
      })
      cell.addEventListener('drop', event => {
        event.preventDefault()
        var oldPointId = event.dataTransfer.getData("text")
        var oldPoint = document.getElementById(oldPointId)
        var newPoint = event.target
        var newPointNoListeners = newPoint.cloneNode(true);
        newPoint.parentNode.replaceChild(newPointNoListeners, newPoint);
        if (oldPointId == this.startCell.id) {
          this.startCell = newPointNoListeners
          this.startCell.draggable = true
          newPointNoListeners.setAttribute('class','start')
        } else {
          this.finishCell = newPoint
          this.finishCell.draggable = true
          newPointNoListeners.setAttribute('class','finish')
        }
        oldPoint.removeAttribute('dragstart')
        oldPoint.draggable = false
        oldPoint.removeAttribute('class')
        this._initCellLocalEventListener(oldPoint)
        this._initCellStartLocalEventListener(newPointNoListeners)
        this.onPointChanged(event.target.id, oldPointId)
      })
      cell.addEventListener('mouseenter', event => {
        if (event.which==1){
          if (event.shiftKey){
            if (cell.classList.contains('weight')) {
              cell.removeAttribute('class','weight')
              this.onWeightSet(cell.id,false)
            } else if (cell.classList.contains('wall')) {
              this.onWallSet(cell.id,false)
              cell.setAttribute('class','weight')
              this.onWeightSet(cell.id,true)
            } else {
              cell.setAttribute('class','weight')
              this.onWeightSet(cell.id,true)
            }
          } else{
            if (cell.classList.contains('wall')) {
              cell.removeAttribute('class','wall')
              this.onWallSet(cell.id,false)
            } else if (cell.classList.contains('weight')) {
              this.onWeightSet(cell.id,false)
              cell.setAttribute('class','wall')
              this.onWallSet(cell.id,true)
            } else {
              cell.setAttribute('class','wall')
              this.onWallSet(cell.id,true)
            }
          }
        }
      })
      cell.addEventListener('mousedown', event => {
        if (event.which==1){
          if (event.shiftKey){
            if (cell.classList.contains('weight')) {
              cell.removeAttribute('class','weight')
              this.onWeightSet(cell.id,false)
            } else if (cell.classList.contains('wall')) {
              this.onWallSet(cell.id,false)
              cell.setAttribute('class','weight')
              this.onWeightSet(cell.id,true)
            } else {
              cell.setAttribute('class','weight')
              this.onWeightSet(cell.id,true)
            }
          } else{
            if (cell.classList.contains('wall')) {
              cell.removeAttribute('class','wall')
              this.onWallSet(cell.id,false)
            } else if (cell.classList.contains('weight')) {
              this.onWeightSet(cell.id,false)
              cell.setAttribute('class','wall')
              this.onWallSet(cell.id,true)
            } else {
              cell.setAttribute('class','wall')
              this.onWallSet(cell.id,true)
            }
          }
        }
      })
  }

  drawTable(size,start,finish) {
    this.grid.innerHTML = "";
    for (var i = 0; i < size; i++) {
      var row = this.grid.insertRow(i);
      for (var j = 0; j < Math.floor(size * 2); j++) {
        var cell = row.insertCell(j);
        cell.setAttribute('id',i.toString() + ',' + j.toString());
        if (i==start[0] && j==start[1])
          {
            cell.setAttribute('class', 'start');
            this.startCell = cell
            this.startCell.draggable = true
            this._initCellStartLocalEventListener(cell)
          }
        else if (i==finish[0] && j==finish[1])
          {
            cell.setAttribute('class','finish');
            cell.draggable = true
            this.finishCell = cell
            this._initCellStartLocalEventListener(cell)
          }
        else this._initCellLocalEventListener(cell)
      }

    }
  };

  _clearTable(walls){
    var cells = document.getElementsByTagName('td')
    for (var i = 0; i < cells.length; i++) {
      cells[i].classList.remove('visited')
      cells[i].classList.remove('onPath')
      if (walls) cells[i].classList.remove('wall')
    }
  }

  drawPath(points, class1, shortestPath, class2) {
    var i = shortestPath ? 1 : 0
    var shortestPathDrawn = false
    this._clearTable()

    function s(cells,className,delay) {
      setTimeout( () => {
        var cell = document.getElementById(cells[i][0] + ',' + cells[i][1])
        cell.classList.add(className)
        i++
        if (i < cells.length) {
          s(cells,className,delay)
        } else {
          i=1
          if (!shortestPathDrawn && shortestPath){
            shortestPathDrawn = true
            s(shortestPath,class2,100)
          }
        }
      },delay)
    }
    s(points,class1,15)


  }

}


function init(){
  var app = new Controller(new View(),new Model());
}


window.onload = init;
