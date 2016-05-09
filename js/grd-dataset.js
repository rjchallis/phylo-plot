
var Dataset = function(json,grid){
  Object.assign(this,json)
  this.cells = {};
  this.grid = grid;
  var ds = this;
  // create cells
  grid.taxorder.forEach(function(taxon,index){
    var cell = new Cell(taxon,[ds.data[taxon]],grid.tree[taxon].parent,ds,1)
    ds.cells[cell.id] = cell;
    var tax = taxon;
    while (grid.tree[tax].parent){
      var tax = grid.tree[tax].parent;
      if (!ds.cells.hasOwnProperty(tax+'_'+ds.id)){
        var desc = grid.tree[tax].descendants;
        var data = []
        desc.forEach(function(name){
          data.push(ds.data[name]); // TODO - make this a function to change aggregate method
        })
        var par_cell = new Cell(tax,data,grid.tree[tax].parent,ds,desc.length)
        ds.cells[par_cell.id] = par_cell;
      }
    }
  })
  return this;
}

Dataset.prototype.drawDataset = function(parent,index){
  var container = parent.append('g').attr('class','grd-ds-group '+this.id).attr('transform','translate('+index*50+',0)');
  var root = this.cells['root'];
  this.setScale();
  //root.drawCell(container,1);
  this.container = container;
  return this;
}

Dataset.prototype.setScale = function(scalename){
  var ds = this;
  scalename = scalename ? scalename : ds.scalename;
  var scale = [];
  ds.scalename.forEach(function(name,index){
    scale[index] = name == 'log' ? d3.scale.log() : name == 'sqrt' ? d3.scale.sqrt() : d3.scale.linear();'log'
    scale[index].domain(ds.range[index])
                .range([0,100])
    if (name == 'radial') scale[index].range([0,2 * Math.PI])
  })
  this.scale = scale;
  return this;
}
