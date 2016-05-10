var Cell = function(id,data,parent,dataset,rowspan){
  this.id = id;
  this.rawdata = data;
  this.parent = parent;
  this.dataset = dataset;
  this.rowspan = rowspan
  this.ancestry = [];
  var taxon = id;
  var nodes = dataset.grid.phylo.nodes;
  while (taxon != 'root'){
    taxon = nodes[taxon].parent;
    this.ancestry.push(taxon);
  }
  return this;
}

Cell.prototype.drawCell = function(parent,recurse){
  var cell = this;
  var ds = cell.dataset;
  cell.cell_group = parent;
  this.collateData();
  this.fillCell();
  return this;
}

Cell.prototype.collateData = function(){
  var cell = this;
  var ds = cell.dataset;
  var ypos = cell.dataset.grid.phylo.nodes[cell.id].y;
  var taxa = ds.grid.tree[cell.id].descendants;
  taxa = taxa ? taxa : [cell.id];
  // convert each datum to object with x, y and species/node properties
  var dimensions = ds.plotvars.length;
  var data = [];
  var ancestry = cell.ancestry.join(' ');
  cell.rawdata.forEach(function(taxdata,index){
    taxdata.forEach(function(datum){
      if (dimensions == 1){
        datum = typeof datum === 'object' ? datum[ds.plotvars[0]] : datum
        data.push({'x':datum,'tax':taxa[index],'ypos':ypos,'ancestry':ancestry})
        cell.ticks = [ds.ticks[ds.plotvars[0]]]
      }
      else if (dimensions == 2){
        data.push({'x':datum[ds.plotvars[0]],'y':datum[ds.plotvars[1]],'tax':taxa[index],'ypos':ypos,'ancestry':ancestry})
        cell.ticks = [ds.ticks[ds.plotvars[0]],ds.ticks[ds.plotvars[1]]]
      }
      else if (dimensions == 3){
        data.push({'x':datum[ds.plotvars[0]],'y':datum[ds.plotvars[1]],'z':datum[ds.plotvars[2]],'tax':taxa[index],'ypos':ypos,'ancestry':ancestry})
      }
    })
  })
  this.data = data;
  return this;
}

Cell.prototype.fillCell = function(){
  var cell = this;
  var ds = cell.dataset;
  cell.plot = new Plot(cell.id,cell.group,cell.data,cell)
  cell.plot.drawPlot('xy')
  return this;
}


/*
Cell.prototype.collapseCell = function(rowspan){
  var cell = this;
  var ds = cell.dataset;
  var parent = ds.cells[cell.parent];
  parent.outer.classed('grd-cell-unclickable',false)
  parent.container.transition()
              .duration(500)
              .style('height',rowspan*50+'px')
  parent.hideChildren(1,rowspan*50);
  if (rowspan == 1){
    var factor = parent.rowspan - rowspan;
    parent.shortenParent(factor,1);
  }
  return this;
}

Cell.prototype.shortenParent = function(factor,recurse){
  var cell = this;
  var ds = cell.dataset;
  if (cell.hasOwnProperty('parent') && cell.parent){
    var parent = ds.cells[cell.parent];
    parent.container.transition()
                .duration(500)
                .style('height',(parent.rowspan - factor)*50+'px')
    if (recurse){
      parent.shortenParent(factor,1);
    }
  }
  return this;
}

Cell.prototype.hideChildren = function(recurse,height){
  var cell = this;
  var ds = cell.dataset;
  var children = ds.grid.tree[cell.id].children;
  if (children){
    var descendants = ds.grid.tree[cell.id].descendants;
    var count = descendants.length;
    if (count > 0){
      children.forEach(function(child){
        var current = ds.cells[child];
        var desc = ds.grid.tree[current.id].descendants;
        var current_count = desc ? desc : 1;
        current.container.transition()
                         .duration(500)
                         .style('opacity',0)
                         .style('height',height/count*current_count)
        setTimeout(function(){
          current.container.classed('grd-cell-hidden',true);
          current.outer.classed('grd-cell-unclickable',true);
        },500)
        if (recurse){
          current.hideChildren(recurse,height/count*current_count);
        }
      });
    }
  }
}

Cell.prototype.splitCell = function(recurse,depth){
  var cell = this;
  var ds = cell.dataset;
  var children = ds.grid.tree[cell.id].children;
  var delay = 500;
  var depth = depth ? depth : 0;
  if (children){
    cell.container.transition()
                     .duration(function(){if (depth > 0){ return 100; } return delay; })
                     .style('height',cell.rowspan*50)
    console.log('splitting '+cell.id)
    var count = children.length
    if (count > 0){
      cell.outer.classed('grd-cell-unclickable',true)
      children.forEach(function(child){
        var current = ds.cells[child];
        console.log(current.id+' '+current.rowspan)
        current.container.transition()
                         .duration(function(){if (depth > 0){ return 100; } return delay; })
                         .style('opacity',1)
                         .style('height',current.rowspan*50)
        if (depth > 0){
          delay = 100
        }
        setTimeout(function(){
          current.container.classed('grd-cell-hidden',false);
          current.outer.classed('grd-cell-unclickable',false);
          if (recurse){
            depth++;
            current.splitCell(recurse,depth)
          }
        },delay)

      });
    }
  }
  return this;
}
*/
