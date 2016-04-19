var Tree = function (newick){
  this.newick = newick;
  var tree = parse_newick(newick);
  this.nodes = tree;
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
      console.log(newick)
      var nodes = match[1].split(',')
      children['NODE'+i] = [];
      var label = match[2] ? match[2] : null;
      labels['NODE'+i] = label;
      nodes.forEach(function(node){
        [node,brlen] = node.split(':')
        brlen = brlen ? brlen : 1
        tree[node] = { "id":     node,
                        "brlen":  brlen,
                        "open":  true,
                        "ancestor": 'NODE'+i }
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
      tree[child].ancestor = 'root'
    })
    tree['root'] = { "id":     'root',
                     "open":  true,
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
      console.log(taxon)
      console.log(tree[taxon])
      nodes[taxon] = true;
      tree[taxon].y = offset.y;
      tree[taxon].x2 = offset.x + spacing.x;
      tree[taxon].x1 = offset.x;
      tree[taxon].y1 = offset.y;
      tree[taxon].y2 = offset.y;
      if (tree[taxon].open){
        console.log('open')
        offset.y += spacing.y;
      }
      else {
        console.log('closed')
      }
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
    if (tree[taxon].hasOwnProperty('ancestor')){
      var ancestor = tree[taxon].ancestor;
      if (!nodes[ancestor]){
        layoutNode(ancestor)
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
       .attr('height', '100%')
       .attr('viewBox', '0 0 ' + tree.width + ' ' + tree.height)
       .attr('preserveAspectRatio', 'xMidYMid meet')
    console.log('here')
    group = svg.append('g');
    tree.svg = svg;
    tree.treegroup = group;
  }
  var groups = group.selectAll('g.grd-tree-node').data(data);
  var node_g = groups.enter()
                     .append('g')
                     .attr('class','grd-tree-node');
  node_g.append('line')
        .attr('class','grd-tree-line vert')
  node_g.append('line')
        .attr('class','grd-tree-line horiz')
  node_g.append('circle')
        .attr('class','grd-tree-line handle')
  groups.selectAll('.grd-tree-line.vert')
        .attr('x1', function(d){return tree.width - d.x1})
        .attr('x2', function(d){return tree.width - d.x1})
        .attr('y1', function(d){return tree.height - d.y1})
        .attr('y2', function(d){return tree.height - d.y2})
  groups.selectAll('.grd-tree-line.horiz')
        .attr('x1', function(d){return tree.width - d.x1})
        .attr('x2', function(d){return tree.width - d.x2})
        .attr('y1', function(d){return tree.height - d.y})
        .attr('y2', function(d){return tree.height - d.y})
  groups.selectAll('.grd-tree-line.handle')
        .attr('cx', function(d){return tree.width - d.x1})
        .attr('cy', function(d){return tree.height - d.y})
        .attr('r', function(d){return tree.spacing.y/8})
        .on('click',function(d){
          tree.nodes[d.id].descendants.forEach(function(tax){
            tree.nodes[tax].open = false;
          })
          tree.layoutNodes().drawTree()
        })
  groups.exit().remove();
  return this;
}
