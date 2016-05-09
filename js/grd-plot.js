var Plot = function(id,parent,data,cell){
  this.id = id;
  this.parent = parent;
  this.data = data;
  this.cell = cell;
  return this;
}

Plot.prototype.addSvg = function(){
  var parent = this.parent;
  var svg = parent.append('svg');
  svg.attr('width', '100%')
     .attr('height', '100%')
     .attr('viewBox', '0 0 ' + 100 + ' ' + 100)
     .attr('preserveAspectRatio', 'xMidYMid meet')
  this.svg = svg;
  return this;
}

Plot.prototype.addGrid = function(){
  var plot = this;
  var ds_group = plot.cell.dataset.gridcontainer;
  var g = ds_group.select('.grd-plot-ticks.'+plot.cell.id);
  if (g.empty()){
    var g = ds_group.append('g').attr('class','grd-plot-ticks '+plot.cell.id)
  }
  g.attr('transform','translate(0,'+plot.data[0].ypos+')');
  var ticks = plot.cell.ticks;
  var scale = plot.cell.dataset.scale;
  var rect = g.append('rect')
              .attr('width',50)
              .attr('height',50)
              ;
  ticks.forEach(function(count,index){
    if (count > 0){
      count = count + 1;
      width = Math.abs(scale[index].domain()[1]-scale[index].domain()[0]) / count;
      for (c = 1; c < count; c++){
        if (index == 0){
          g.append('line')
           .attr('x1',scale[index](c*width))
           .attr('x2',scale[index](c*width))
           .attr('y2',50);
        }
        else if (index == 1){
            g.append('line')
             .attr('y1',scale[index](c*width))
             .attr('y2',scale[index](c*width))
             .attr('x2',50);
        }
      }
    }
  })
  this.ticks = ticks;
  this.scale = scale;
  return this;
}


Plot.prototype.plotData = function(plottype){
  // TODO - use plottype variable
  // TODO - improve styling
  var plot = this;
  var cell_group = plot.cell.cell_group;
  var g = cell_group;
  var scale = plot.cell.dataset.scale;
  var data = this.data;
  var colours = this.cell.dataset.hasOwnProperty('colour') ? this.cell.dataset.colour : {};
  var circles = g.selectAll('circle.'+plot.cell.id).data(data);
  circles.enter().append('circle')
         .style('opacity',0)
         .attr('class',function(d){return plot.cell.id + ' ' + d.ancestry});
  circles.attr('r',4)
         .transition().duration(500)
         .style('opacity',1)
         .attr('cx',function(d){return scale[0](d.x)})
         .attr('cy',function(d){if (scale[1]) return 25 + d.ypos - scale[1](d.y); return d.ypos})
         .attr('rel',function(d){return d.tax})
         .style('fill',function(d){if (colours.hasOwnProperty(d.tax)) return colours[d.tax];})
  circles.on('mouseover', plot.cell.dataset.tip.show)
         .on('mouseout', plot.cell.dataset.tip.hide)

  circles.exit().transition().duration(500).style('opacity',0).remove();
  return this;
}

Plot.prototype.drawPlot = function(){
  //this.addSvg();
  this.addGrid();
  this.plotData();
  return this;
}
