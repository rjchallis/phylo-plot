var Cell = function(id,data,parent,dataset,rowspan){
  this.id = id;
  this.rawdata = data;
  this.parent = parent;
  this.dataset = dataset;
  this.rowspan = rowspan
  return this;
}

Cell.prototype.drawCell = function(parent,recurse){
  var cell = this;
  var ds = cell.dataset;
  var depth = ds.grid.tree[cell.id].depth;
  var grd_cell_container = parent.append('div').attr('rel',this.id).attr('class','grd-cell-container '+this.dataset.id+' '+this.id).style('height',this.rowspan*100+'px').style('z-index',depth);
  var grd_cell_outer = grd_cell_container.append('div').attr('rel',this.id).attr('class','grd-cell-outer '+this.dataset.id+' '+this.id).style('background-color','#'+Math.floor(Math.random()*16777215).toString(16));
  var grd_cell_nest = grd_cell_container.append('div').attr('rel',this.id).attr('class','grd-cell-nest '+this.dataset.id+' '+this.id).style('z-index',depth);
  if (recurse){
    var children = ds.grid.tree[cell.id].children;
    if (children && children.length > 0){
      grd_cell_outer.classed('grd-cell-unclickable',true)
      children.forEach(function(child){
        ds.cells[child].drawCell(grd_cell_nest,1);
      });
    }
    else {
      this.leaf = true;
    }
  }
  this.container = grd_cell_container;
  this.outer = grd_cell_outer;
  this.nest = grd_cell_nest;
  //if (this.id != 'root'){
    grd_cell_outer.on('click',function(){
      event.stopPropagation();
      var selection = d3.select(this);
      var width = selection.node().getBoundingClientRect().width;
      var x = d3.mouse(this)[0];
      var current = cell.dataset.cells[selection.attr('rel')];
      if (x < width/2){
        if (current.id != 'root'){
          current.collapseCell()
        }
      }
      else if (!cell.leaf){
        current.splitCell()
      }
    });
  //}
  this.prepareData();
  this.fillCell();
  return this;
}

Cell.prototype.prepareData = function(){
  var cell = this;
  var ds = cell.dataset;
  var taxa = ds.grid.tree[cell.id].descendants;
  taxa = taxa ? taxa : [cell.id];
  // convert each datum to object with x, y and species/node properties
  var dimensions = ds.plotvars.length;
  var data = [];
  cell.rawdata.forEach(function(taxdata,index){
    taxdata.forEach(function(datum){
      if (dimensions == 1){
        datum = typeof datum === 'object' ? datum[ds.plotvars[0]] : datum
        data.push({'x':datum,'tax':taxa[index]})
        cell.ticks = [ds.ticks[ds.plotvars[0]]]
      }
      else if (dimensions == 2){
        data.push({'x':datum[ds.plotvars[0]],'y':datum[ds.plotvars[1]],'tax':taxa[index]})
        cell.ticks = [ds.ticks[ds.plotvars[0]],ds.ticks[ds.plotvars[1]]]
      }
      else if (dimensions == 3){
        data.push({'x':datum[ds.plotvars[0]],'y':datum[ds.plotvars[1]],'z':datum[ds.plotvars[2]],'tax':taxa[index]})
      }
    })
  })
  this.data = data;
  return this;
}

Cell.prototype.fillCell = function(){
  var cell = this;
  var ds = cell.dataset;
  cell.plot = new Plot(cell.id,cell.outer,cell.data,cell)
  cell.plot.drawPlot('xy')
  return this;
}

Cell.prototype.collapseCell = function(){
  var cell = this;
  var ds = cell.dataset;
  var parent = ds.cells[cell.parent];
  parent.outer.classed('grd-cell-unclickable',false)
  parent.hideChildren(1);
  return this;
}

Cell.prototype.hideChildren = function(recurse){
  var cell = this;
  var ds = cell.dataset;
  var children = ds.grid.tree[cell.id].children;
  if (children && children.length > 0){
    children.forEach(function(child){
      var current = ds.cells[child];
      current.container.classed('grd-cell-hidden',true);
      current.outer.classed('grd-cell-unclickable',true);
      if (recurse){
        current.hideChildren(recurse);
      }
    });
  }
}

Cell.prototype.splitCell = function(){
  var cell = this;
  var ds = cell.dataset;
  var children = ds.grid.tree[cell.id].children;
  if (children && children.length > 0){
    cell.outer.classed('grd-cell-unclickable',true)
    children.forEach(function(child){
      ds.cells[child].container.classed('grd-cell-hidden',false);
      ds.cells[child].outer.classed('grd-cell-unclickable',false);
    });
  }
  return this;
}
