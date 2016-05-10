var Plot = function(id,parent,data,dataset){
  this.id = id;
  this.parent = parent;
  this.data = data;
  this.dataset = dataset;
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
  var g = plot.dataset.container;
  var scale = plot.dataset.scale;
  var data = plot.data;
  var colours = plot.dataset.hasOwnProperty('colour') ? plot.dataset.colour : {};
  var circles = g.selectAll('circle.'+plot.id).data(data);
  circles.enter().append('circle')
         .style('opacity',0)
         .attr('class',function(d){return plot.id + ' ' + d.tax + ' ' + d.ancestry});
  circles.attr('r',4)
         .transition().duration(500)
         .style('opacity',1)
         .attr('cx',function(d){return scale[0](d[0].x)})
         .attr('cy',function(d){if (scale[1]) return 25 + d[0].ypos - scale[1](d[0].y); return d[0].ypos})
         .attr('rel',function(d){return d[0].tax})
         .style('fill',function(d){if (colours.hasOwnProperty(d[0].tax)) return colours[d[0].tax];})
  circles.on('mouseover', plot.dataset.tip.show)
         .on('mouseout', plot.dataset.tip.hide)
  circles.exit().transition().duration(500).style('opacity',0).remove();
  return this;
}

function box (selection){
  selection.append('circle').attr('r',10)
}

Plot.prototype.plotBoxAndWhiskers = function(plottype){
  // TODO - use plottype variable
  // TODO - improve styling
  var plot = this;
  var cell_group = plot.cell.cell_group;
  var g = cell_group;
  var scale = plot.cell.dataset.scale;
  var data = [];
  if (plot.data.length >= 3){
    ['x','y','z'].forEach(function(axis){
      if (plot.data[0].hasOwnProperty(axis)){
        var datum = {}
        var arr = plot.data.map(function(d){return d[axis]}).sort()
        datum.mean = d3.median(arr)
        datum.median = d3.median(arr)
        datum.q1 = d3.quantile(arr,0.25)
        datum.q3 = d3.quantile(arr,0.75)
        datum.iqr = datum.q3 - datum.q1
        datum.variance = d3.variance(arr)
        datum.deviation = d3.deviation(arr)
        datum.max = d3.min([d3.max(arr),(datum.mean+datum.deviation)])
        datum.min = d3.max([d3.min(arr),(datum.mean-datum.deviation)])
        datum.ypos = d3.min(plot.data.map(function(d){return d.ypos}))
        data.push(datum)
      }
    })
  }

  var groups = g.selectAll('.box-and-whiskers').data(data);
  groups.enter().append('g')
         .attr('class',function(d){return plot.cell.id + ' box-and-whiskers'})
         //.style('opacity',1);
  groups.attr('transform',function(d){ return 'translate(0,'+(d.ypos)+')'})
  groups.call(box)
  //groups.transition().delay(250).duration(500)
  //       .style('opacity',1)

//  groups.exit().remove();
  return this;
}

Plot.prototype.drawPlot = function(){
  //this.addSvg();
  //this.addGrid();
  this.plotData();
  //this.plotBoxAndWhiskers();
  return this;
}
