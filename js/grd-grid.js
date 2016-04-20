var Grid = function (id){
  this.id = id;
  this.datasets = {};
  this.order = [];
  return this;
}

Grid.prototype.addTree = function(newick){
  var grid = this;
  var phylo = new Tree(grid,newick)
  this.phylo = phylo;
  this.tree = phylo.nodes;
  this.taxorder = phylo.taxorder;
  return this;
}


Grid.prototype.addDataset = function(url){
  var grid = this;
  $.getJSON(url,{},function(json){
    var ds = new Dataset(json,grid);
    grid.datasets[ds.id] = ds;
    grid.order.push(ds.id);
  })
  return this;
}

Grid.prototype.drawGrid = function(parent_div_id){
  var parent = d3.select('#'+parent_div_id);
  var grd_container = parent.append('div').attr('class','grd-container '+this.id);
  var grd_outer = grd_container.append('div').attr('class','grd-outer '+this.id);
  var grd_tree_container = grd_outer.append('div').attr('class','grd-tree-container '+this.id);
  var grd_tree_outer = grd_tree_container.append('div').attr('class','grd-tree-outer '+this.id);
  var grid = this;
  grid.phylo.layoutNodes()
  grid.phylo.drawTree(grd_tree_outer)
  grid.order.forEach(function(ds_id){
    var ds = grid.datasets[ds_id];
    ds.drawDataset(grd_outer);
  })
}
