var Plot = function(id,parent,data,dataset,members){
  this.id = id;
  this.parent = parent;
  this.data = data;
  this.dataset = dataset;
  this.members = members.length > 0 ? members : [id];
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


Plot.prototype.plotSummary = function(parameter){

  var plot = this;
  var ds = plot.dataset;
  var g = ds.container;
  var scale = ds.scale;
  var data = plot.data;

  var selection = g.selectAll('.grd-summary-group.'+plot.members.join(', .grd-summary-group.')).data(data);
  var selenter = selection.enter().append('g').attr('transform',function(d){return 'translate(0,'+d.ypos+')'}).style('opacity',0);
  selenter.append('line').attr('y1',-20).attr('y2',20);
  if(ds.plotvars.length > 1){
    selenter.append('line').attr('x1',function(d){return (5- scale[0](d.x.mean))})
                           .attr('x2',function(d){return (45 - scale[0](d.x.mean))})
                           .attr('y1',function(d){return (25 - scale[1](d.y.mean))})
                           .attr('y2',function(d){return (25 - scale[1](d.y.mean))});
  }
  //selection.call(plot.plotBoxAndWhiskers,plot);
  selection.attr('class',function(d){return 'grd-summary-group ' + plot.id});
  selection.transition().delay(0).duration(500).attr('transform',function(d){return 'translate('+scale[0](d.x.mean)+','+d.ypos+')'})
       .style('opacity',1)

    selection.exit().transition().duration(500).attr('transform',function(d){return 'translate(0,'+d.ypos+')'}).style('opacity',0).remove();



}


Plot.prototype.addGrid = function(selection,plot){

    var ds = plot.dataset;
    var g = ds.container;
    var scale = ds.scale;
    var ticks = plot.dataset.ticks;
    var scale = plot.dataset.scale;

    var selenter = selection.enter().append('g').attr('transform',function(d){return 'translate(0,'+d.ypos+')'}).style('opacity',0)
    selenter.append('rect')
                .attr('width',50)
                .attr('height',50)
                //.transition().delay(0).duration(1500).attr('height',50)
    //selection.call(plot.plotBoxAndWhiskers,plot);
    selection.attr('class',function(d){return 'grd-plot-ticks ' + plot.id});
    selection.transition().delay(0).duration(500).attr('transform',function(d){return 'translate(0,'+d.ypos+')'})
         .style('opacity',1)

      selection.exit().transition().duration(500).style('opacity',0).remove();

    ticks.forEach(function(count,index){
      if (count > 0){
        count = count + 1;
        width = Math.abs(scale[index].domain()[1]-scale[index].domain()[0]) / count;
        for (c = 1; c < count; c++){
          if (index == 0){
            selenter.append('line')
             .attr('x1',scale[index](c*width))
             .attr('x2',scale[index](c*width))
             .attr('y2',50);
          }
          else if (index == 1){
              selenter.append('line')
               .attr('y1',scale[index](c*width))
               .attr('y2',scale[index](c*width))
               .attr('x2',50);
          }
        }
      }
    })


}



Plot.prototype.plotGrid = function(plottype){
  // TODO - use plottype variable
  // TODO - improve styling
  var plot = this;
  var ds = plot.dataset;
  var g = ds.container;
  var scale = ds.scale;
  var data = plot.data;
  plot.members.unshift(plot.id)
  var colours = ds.hasOwnProperty('colour') ? ds.colour : {};
  var ds_group = ds.gridcontainer;
  var grids = ds_group.selectAll('.grd-plot-ticks.'+plot.members.join(', .grd-plot-ticks.')).data(data);
  //grids.enter().append('g').style('opacity',0)
  grids.call(plot.addGrid,plot);

  return this;
}


Plot.prototype.plotData = function(plottype){
  // TODO - use plottype variable
  // TODO - improve styling
  var plot = this;
  var ds = plot.dataset;
  var g = ds.container;
  var scale = ds.scale;
  var data = plot.data;
  var colours = ds.hasOwnProperty('colour') ? ds.colour : {};
  var ds_group = ds.gridcontainer;
  //var grids = ds_group.selectAll('.grd-plot-ticks.'+plot.members.join(', .grd-plot-ticks.')).data(data);
  //grids.enter().append('g').style('opacity',0)
  //grids.call(plot.addGrid,plot);
  //grids.exit().transition().duration(500).style('opacity',0).remove();
  var circles = g.selectAll('circle.'+plot.members.join(', circle.')).data(data);
  circles.enter().append('circle').style('opacity',0)
         .attr('class',function(d){return d.tax});
  circles.attr('r',4)
         .transition().duration(500)
         .style('opacity',1)
         .attr('cx',function(d){return scale[0](d.x)})
         .attr('cy',function(d){if (scale[1]) return 25 + d.ypos - scale[1](d.y); return d.ypos})
         .attr('rel',function(d){return d.tax})
         .style('fill',function(d){if (colours.hasOwnProperty(d.tax)) return colours[d.tax];})
  circles.on('mouseover', plot.dataset.tip.show)
         .on('mouseout', plot.dataset.tip.hide)

  circles.exit().transition().duration(500).style('opacity',0).remove();


  return this;
}
