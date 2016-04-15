var Plot = function(id,parent,data,cell){
  this.id = id;
  this.parent = parent;
  this.data = data;
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
  var svg = this.svg;
  var g = svg.append('g').attr('class','grd-plot-ticks');
  var ticks = this.cell.ticks;
  var scale = this.cell.dataset.scale;
  var rect = g.append('rect')
              .attr('width',100)
              .attr('height',100);
  ticks.forEach(function(count,index){
    if (count > 0){
      count = count + 1;
      width = Math.abs(scale[index].domain()[1]-scale[index].domain()[0]) / count;
      for (c = 0.00001; c <= count; c++){
        if (index == 0){
          g.append('line')
           .attr('x1',scale[index](c*width))
           .attr('x2',scale[index](c*width))
           .attr('y2',100);
        }
        else if (index == 1){
            g.append('line')
             .attr('y1',scale[index](c*width))
             .attr('y2',scale[index](c*width))
             .attr('x2',100);
        }
      }
    }
  })
  this.ticks = ticks;
  this.scale = scale;
  return this;
}

Plot.prototype.plotData = function(){
  var svg = this.svg;
  var g = svg.append('g').attr('class','grd-plot-data');
  var scale = this.scale;
  var data = this.data;
  g.append("text").attr('transform','translate(0,20)').text(JSON.stringify(data));
  var circles = g.selectAll('circle').data(data)
  circles.enter().append('circle');
  circles.attr('r',5)
         .attr('cx',function(d){return scale[0](d.x)})
         .attr('cy',function(d){return 100 - scale[1](d.y)})
  circles.exit().remove();
  return this;
}

Plot.prototype.drawPlot = function(){
  this.addSvg();
  this.addGrid();
  this.plotData();
  return this;
}
