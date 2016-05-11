
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
  this.tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return "<strong>Taxon:</strong> <span style='color:#fe7001'>" + d.tax + "</span>";
    })

  return this;
}

Dataset.prototype.drawDataset = function(parent,index){
  var ds = this;
  var container = parent.select('.grd-ds-group.'+this.id);
  if (container.empty()){
    gridcontainer = parent.append('g').attr('class','grd-ds-grid-group '+this.id).attr('transform','translate('+index*50+',0)');
    container = parent.append('g').attr('class','grd-ds-group '+this.id).attr('transform','translate('+index*50+',25)');
    this.gridcontainer = gridcontainer;
    container.call(this.tip);
  }
  this.container = container;
  var root = this.cells['root'];
  this.setScale();
  var taxorder = this.grid.phylo.taxorder;
  var nodes = this.grid.phylo.nodes;
  var termini = {};
  taxorder.forEach(function(taxon){
    var par = taxon;
    var taxa = [];
    if (nodes[par].visible == true){
      taxa.push(par);
    }
    else {
      while (nodes[par].visible != true){
        taxa.push(par);
        par = nodes[par].parent;
      }
    }
    if (termini.hasOwnProperty(par)){
      taxa.forEach(function(tax){
        if (termini[par].indexOf(tax) == -1){
          termini[par].push(tax);
        }
      })
    }
    else {
      termini[par] = taxa.slice(0);
    }
  })
  Object.keys(termini).forEach(function(taxon){
    ds.cells[taxon].drawCell(container);
    console.log(taxon+' '+JSON.stringify(termini[taxon]))
  })
  this.termini = termini;
  return this;
}

Dataset.prototype.setScale = function(scalename){
  var ds = this;
  scalename = scalename ? scalename : ds.scalename;
  var scale = [];
  ds.scalename.forEach(function(name,index){
    scale[index] = name == 'log' ? d3.scale.log() : name == 'sqrt' ? d3.scale.sqrt() : d3.scale.linear();'log'
    scale[index].domain(ds.range[index])
                .range([0,50])
    if (name == 'radial') scale[index].range([0,2 * Math.PI])
  })
  this.scale = scale;
  return this;
}
