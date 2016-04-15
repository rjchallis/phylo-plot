var Grid = function (id){
  this.id = id;
  this.datasets = {};
  this.order = [];
  this.tree = {
    "root":  { "children":    ["node3","node4"],
               "descendants": ["sp1","sp2","sp3","sp4","sp5","sp6"],
               "depth":       0,
               "label":       "Lepidoptera"
             },
    "node4": { "children":    ["sp5","sp6"],
               "descendants": ["sp5","sp6"],
               "depth":       1,
               "parent":      "root",
               "label":       "Moths"
             },
    "node3": { "children":    ["sp1","node2"],
               "descendants": ["sp1","sp2","sp3","sp4"],
               "depth":       1,
               "parent":      "root",
               "label":       "Butterflies"
             },
    "node2": { "children":    ["node1","sp4"],
               "descendants": ["sp2","sp3","sp4"],
               "depth":       2,
               "parent":      "node3",
               "label":       "Nymphalidae"
             },
    "node1": { "children":    ["sp2","sp3"],
               "descendants": ["sp2","sp3"],
               "depth":       3,
               "parent":      "node2",
               "label":       "Papilio"
             },
    "sp6":   { "parent":      "node4",
               "label":       "Bombyx mori",
               "depth":       2
             },
    "sp5":   { "parent":      "node4",
               "label":       "Manduca sexta",
               "depth":       2
             },
    "sp4":   { "parent":      "node2",
               "label":       "Pieris napi",
               "depth":       3
             },
    "sp3":   { "parent":      "node1",
               "label":       "Papilio xuthus",
               "depth":       4
             },
    "sp2":   { "parent":      "node1",
               "label":       "Papilio glaucus",
               "depth":       4
             },
    "sp1":   { "parent":      "node3",
               "label":       "Skipper",
               "depth":       2
             }
  }
  this.taxorder = ["sp1","sp2","sp3","sp4","sp5","sp6"];
  return this;
}



Grid.prototype.addDataset = function(url){
  var grid = this;
  $.getJSON(url,{},function(json){
    var ds = new Dataset(json,grid);
    grid.datasets[ds.id] = ds;
    grid.order.push(ds.id);
    grid.height = 600;
    grid.width = 200;
    console.log(grid)
  })
  return this;
}

Grid.prototype.drawGrid = function(parent_div_id){
  var parent = d3.select('#'+parent_div_id);
  var grd_container = parent.append('div').attr('class','grd-container '+this.id).style('height',this.height+'px').style('width',this.width+'px');
  var grd_outer = grd_container.append('div').attr('class','grd-outer '+this.id);
  var grid = this;
  grid.order.forEach(function(ds_id){
    var ds = grid.datasets[ds_id];
    ds.drawDataset(grd_outer);
  })
}
