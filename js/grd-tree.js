var Tree = function (newick){
  this.newick = newick;
  var tree = parse_newick(newick);
  this.nodes = tree;
  this.nodecount = tree.taxorder.length;
  this.tipcount = tree.taxorder.length;
  return this;


  function parse_newick(newick){
    var tree = {};
    var regex = /\(([^\(\)]+)\)([^\(\):,]*)/
    var i = 0;
    var children = {}
    var labels = {}
    while (match = newick.match(regex)){
      i++;
      newick = newick.replace(regex,'NODE'+i)
      var nodes = match[1].split(',')
      children['NODE'+i] = [];
      var label = match[2] ? match[2] : null;
      labels['NODE'+i] = label;
      nodes.forEach(function(node){
        [node,brlen] = node.split(':')
        brlen = brlen ? brlen : 1
        tree[node] = { "id":     node,
                        "brlen":  brlen,
                        "visible":  true,
                        "parent": 'NODE'+i }
        children['NODE'+i].push(node);
        if (node.match('NODE')){
          tree[node].children = children[node]
          tree[node].descendants = list_descendants(children,node)
        }
        if (labels.hasOwnProperty(node)){
          tree[node].label = labels[node]
        }
        else {
          tree[node].label = node
        }
      })
    }
    children['NODE'+i].forEach(function(child){
      tree[child].parent = 'root'
    })
    tree['root'] = { "id":     'root',
                     "visible":  true,
                      "label":  'root'
                     }
    tree['root'].children = children['NODE'+i]
    tree['root'].descendants = list_descendants(children,'NODE'+i)
    tree.taxorder = tree['root'].descendants;
    return tree;
  }

  function list_descendants (object,key){
    var desc = []
    if (object.hasOwnProperty(key)){
      var children = object[key];
      children.forEach(function(subkey){
        desc = desc.concat(list_descendants(object,subkey));
      })
    }
    else {
      desc.push(key)
    }
    return desc
  }

}

Tree.prototype.layoutNodes = function(width,height){
  // TODO - walk through the tree to determine x and y positions of each node
  var tree = this.nodes;
  var offset = {x:50,y:50};
  var spacing = {x:50,y:100}
  width = width ? width : 300;
  height = height ? height : spacing.y*tree.taxorder.length-1 + 2*offset.y;
  width = width ? width : height / 2;
  var taxon = tree.taxorder[0];
  var nodes = {};
  layoutNode(taxon);
  //tree.taxorder.forEach(function(taxon,index){
  function layoutNode(taxon){
    if (!tree[taxon].hasOwnProperty('children')){
      nodes[taxon] = true;
      tree[taxon].y = offset.y;
      tree[taxon].x2 = offset.x + spacing.x;
      tree[taxon].x1 = offset.x;
      tree[taxon].y1 = offset.y;
      tree[taxon].y2 = offset.y;
      tree[taxon].leaf = true;
      offset.y += spacing.y;
    }
    else {
      tree[taxon].descendants.forEach(function(descendant){
        if (!nodes[descendant]){
          layoutNode(descendant)
        }
      })
      var y = 0;
      var miny = 99999999;
      var maxy = -1
      var maxx = -1
      var count = tree[taxon].children.length;
      for (var i = 0; i < count; i++){
        var yy = tree[tree[taxon].children[i]].y;
        var xx = tree[tree[taxon].children[i]].x2;
        y += yy;
        miny = yy < miny ? yy : miny;
        maxy = yy > maxy ? yy : maxy;
        maxx = xx > maxx ? xx : maxx;
      }
      for (var i = 0; i < count; i++){
        tree[tree[taxon].children[i]].x2 = maxx;
      }
      y = y / count;
      tree[taxon].y = y
      tree[taxon].y1 = miny
      tree[taxon].y2 = maxy
      tree[taxon].x1 = xx
      tree[taxon].x2 = xx + spacing.x
    }
    if (tree[taxon].hasOwnProperty('parent')){
      var parent = tree[taxon].parent;
      if (!nodes[parent]){
        layoutNode(parent)
      }
    }
    return true;
  }
  this.width = width
  this.height = height
  this.offset = offset
  this.spacing = spacing
  return this;
}

Tree.prototype.hideNode = function(node){
  var t = this;
  var count = 0;
  if (t.nodes[node].hasOwnProperty('children')){
    var children = t.nodes[node].children;
     children.forEach(function(child){
      count += t.hideNode(child)
    })
    if (t.nodes[node].collapsed) {
      count ++;
      t.nodecount--;
    }
  }
  else if (t.nodes[node].visible) {
    t.nodecount--;
  }
  t.nodes[node].visible = false;
  t.nodes[node].collapsed = false;
  return count;
}

Tree.prototype.collapseNode = function(ancestor){
  // TODO - walk through the tree to determine x and y positions of each node
  var t = this;
  var tree = t.nodes;
  t.nodecount++;
  tree[ancestor].collapsed = true;
  var descendants = tree[ancestor].descendants;
  var index = tree.taxorder.indexOf(tree[ancestor].descendants[0])
  var tax = tree[tree.taxorder[index]]
  var y = tax.y
  var offset = 0
  descendants.forEach(function(desc){
    tree[desc].y = y
    tree[desc].y1 = y
    tree[desc].y2 = y
    if (tree[desc].visible){
      offset += t.spacing.y
    }
  })

  var precollapsed = 0;
  var children = tree[ancestor].children;
  children.forEach(function(child){
    precollapsed += t.hideNode(child)
  })

  offset += precollapsed * t.spacing.y

  for (var i = index + descendants.length; i < tree.taxorder.length; i++){
    var tax = tree[tree.taxorder[i]]
    tax.y -= offset - t.spacing.y
    tax.y1 -= offset - t.spacing.y
    tax.y2 -= offset - t.spacing.y
  }

  var nodes = {};
  var taxon = tree.taxorder[0]
  layoutNode(taxon);


  function layoutNode(taxon){
    if (!tree[taxon].hasOwnProperty('children')){
      nodes[taxon] = true;

    }
    else {
      tree[taxon].descendants.forEach(function(descendant){
        if (!nodes[descendant]){
          layoutNode(descendant)
        }
      })
      var y = 0;
      var miny = 99999999;
      var maxy = -1
      var maxx = -1
      var count = tree[taxon].children.length;
      for (var i = 0; i < count; i++){
        var yy = tree[tree[taxon].children[i]].y;
        var xx = tree[tree[taxon].children[i]].x2;
        y += yy;
        miny = yy < miny ? yy : miny;
        maxy = yy > maxy ? yy : maxy;
        maxx = xx > maxx ? xx : maxx;
      }
      for (var i = 0; i < count; i++){
        tree[tree[taxon].children[i]].x2 = maxx;
      }
      y = y / count;
      tree[taxon].y = y
      tree[taxon].y1 = miny
      tree[taxon].y2 = maxy
      tree[taxon].x1 = xx
      tree[taxon].x2 = xx + t.spacing.x
    }
    if (tree[taxon].hasOwnProperty('parent')){
      var parent = tree[taxon].parent;
      if (!nodes[parent]){
        layoutNode(parent)
      }
    }
    return true;
  }


  return this;
}


Tree.prototype.showNode = function(node){
  var t = this;
  if (t.nodes[node].hasOwnProperty('children')){
    var children = t.nodes[node].children;
     children.forEach(function(child){
      t.showNode(child)
    })
    if (t.nodes[node].collapsed) {
      t.nodecount--;
    }
  }
  else if (!t.nodes[node].visible) {
    t.nodecount++;
  }
  t.nodes[node].visible = true;
  t.nodes[node].collapsed = false;
  return this;
}

Tree.prototype.expandNode = function(ancestor){
  // TODO - walk through the tree to determine x and y positions of each node
  var t = this;
  var tree = t.nodes;
  t.nodecount--;
  tree[ancestor].collapsed = false
  var descendants = tree[ancestor].descendants;
  var index = tree.taxorder.indexOf(tree[ancestor].descendants[0])
  var tax = tree[tree.taxorder[index]]
  var y = tax.y
  var offset = 0
  descendants.forEach(function(desc,index){
    if (index > 0){
      offset += t.spacing.y
      tree[desc].y += offset
      tree[desc].y1 += offset
      tree[desc].y2 += offset
    }
  })
  var children = tree[ancestor].children;
  children.forEach(function(child){
    t.showNode(child)
  })

  for (var i = index+descendants.length; i < tree.taxorder.length; i++){
    var tax = tree[tree.taxorder[i]]
    tax.y += offset
    tax.y1 += offset
    tax.y2 += offset
  }

  var nodes = {};
  var taxon = tree.taxorder[0]
  layoutNode(taxon);


  function layoutNode(taxon){
    if (!tree[taxon].hasOwnProperty('children')){
      nodes[taxon] = true;

    }
    else {
      tree[taxon].descendants.forEach(function(descendant){
        if (!nodes[descendant]){
          layoutNode(descendant)
        }
      })
      var y = 0;
      var miny = 99999999;
      var maxy = -1
      var maxx = -1
      var count = tree[taxon].children.length;
      for (var i = 0; i < count; i++){
        var yy = tree[tree[taxon].children[i]].y;
        var xx = tree[tree[taxon].children[i]].x2;
        y += yy;
        miny = yy < miny ? yy : miny;
        maxy = yy > maxy ? yy : maxy;
        maxx = xx > maxx ? xx : maxx;
      }
      for (var i = 0; i < count; i++){
        tree[tree[taxon].children[i]].x2 = maxx;
      }
      y = y / count;
      tree[taxon].y = y
      tree[taxon].y1 = miny
      tree[taxon].y2 = maxy
      tree[taxon].x1 = xx
      tree[taxon].x2 = xx + t.spacing.x
    }
    if (tree[taxon].hasOwnProperty('parent')){
      var parent = tree[taxon].parent;
      if (!nodes[parent]){
        layoutNode(parent)
      }
    }
    return true;
  }


  return this;
}


Tree.prototype.drawTree = function(){
  var data = [];
  var tree = this;

  Object.keys(tree.nodes).forEach(function(key){
    if (key != 'taxorder') data.push(tree.nodes[key])
  })
  var svg;
  var group;
  if (tree.svg){
    svg = tree.svg
    group = tree.treegroup;
  }
  else {
    svg = d3.select('#tree').append('svg');
    svg.attr('width', '100%')
       .attr('preserveAspectRatio', 'xMidYMid meet')
    group = svg.append('g')
               .attr('transform','translate(0,'+tree.spacing.y/2+')');
    tree.svg = svg;
    tree.treegroup = group;
  }
  var new_height = (tree.nodecount) * tree.spacing.y
  var new_start = (tree.tipcount - tree.nodecount) * tree.spacing.y + tree.spacing.y *1.5
  svg.transition().duration(500).attr('viewBox', '0 ' + new_start + ' ' + tree.width + ' ' + new_height)
                                .attr('height', new_height)
  var groups = group.selectAll('g.grd-tree-node').data(data);
  var node_g = groups.enter()
                     .append('g')
                     .attr('class','grd-tree-node');
  node_g.append('line')
        .attr('class','grd-tree-line grd-tree-vert')
  node_g.append('line')
        .attr('class','grd-tree-line grd-tree-horiz')
  node_g.append('circle')
        .attr('class','grd-tree-line grd-tree-handle')
  var vert = groups.selectAll('.grd-tree-line.grd-tree-vert')
  //vert.style('visibility',function(d){if (d.visible){return 'visible'} return 'hidden'})

  vert.style('visibility',function(d){if (d.visible){return 'visible'}})
  vert.transition().duration(500)
        .attr('x1', function(d){return tree.width - d.x1})
        .attr('x2', function(d){return tree.width - d.x1})
        .attr('y1', function(d){return tree.height - d.y1})
        .attr('y2', function(d){return tree.height - d.y2})
        .style('opacity',function(d){if (d.visible){return 1} return 0})
        .transition().duration(0).style('visibility',function(d){if (d.visible){return 'visible'} return 'hidden'})
  var horiz = groups.selectAll('.grd-tree-line.grd-tree-horiz')
//  horiz.style('visibility',function(d){if (d.visible){return 'visible'} return 'hidden'})
  horiz.style('visibility',function(d){if (d.visible){return 'visible'}})
  horiz.transition().duration(500)
        .attr('x1', function(d){return tree.width - d.x1})
        .attr('x2', function(d){return tree.width - d.x2})
        .attr('y1', function(d){return tree.height - d.y})
        .attr('y2', function(d){return tree.height - d.y})
        .style('opacity',function(d){if (d.visible){return 1} return 0})
        .transition().duration(0).style('visibility',function(d){if (d.visible){return 'visible'} return 'hidden'})
  var handles = groups.selectAll('.grd-tree-line.grd-tree-handle')
//  handles.style('visibility',function(d){if (d.visible){return 'visible'} return 'hidden'})
  handles.style('visibility',function(d){if (d.visible){return 'visible'}})
  handles.transition().duration(500)
        .attr('cx', function(d){return tree.width - d.x1})
        .attr('cy', function(d){return tree.height - d.y})
        .attr('r', function(d){return tree.spacing.y/8})
        .style('opacity',function(d){if (d.visible){return 1} return 0})
        .style('fill',function(d){if (d.collapsed){return '#999999'} return '#333333'})
        .transition().duration(0).style('visibility',function(d){if (d.visible){return 'visible'} return 'hidden'})
  handles.on('click',function(d){
            if (d.hasOwnProperty('children')){
              if (!d.collapsed){
                tree.collapseNode(d.id).drawTree()
              }
              else {
                tree.expandNode(d.id).drawTree()
              }
            }
        })
  groups.exit().remove();
  return this;
}
