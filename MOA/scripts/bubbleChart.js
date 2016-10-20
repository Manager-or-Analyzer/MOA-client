
var period = function(){
    this.fromDate =  $("#from").val();
    this.toDate = $("#from").val();
    console.log("start : " + this.fromDate);
};
var server_addr_snp = "http://210.118.74.183:8080/moa/receive/keyword";
console.log("start ㅉㅈ: " + $("#from").val());

var diameter = 390,
    format = d3.format(",d"),
    color = d3.scale.category20();

var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(1.5);

var svg = d3.select("#bubble").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");




$.ajax({                //Send (docinfo) to server
        url : server_addr_snp,
        type : 'POST',
        async : true,
        dataType : 'json',
        data : {data : period},
        success : function(data){
            
        d3.json(data, function(error, root) {
          if (error) throw error;

          var node = svg.selectAll(".node")
              .data(bubble.nodes(classes(root))
              .filter(function(d) { return !d.children; }))
              .enter().append("g")
              .attr("class", "node")
              .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

          node.append("title")
              .text(function(d) { return d.className + ": " + format(d.value); });

          var circle = node.append("circle") 
              .attr("r",0)
              .transition()
              .duration(function(d,i){return d.depth * 1000 + 500 ;})
              .attr("r", function(d) { return d.r; })
              .style("fill", function(d,i) { return color(i); })
              .style("opacity",0.55);

          node.append("text")
            .style("text-anchor", "middle")
            .text(function(d) { return d.className.substring(0, d.r / 3); })
            .style("font-size", function(d) { return Math.min(2 * d.r/2.5, (2 * d.r/2.5 - 8) / this.getComputedTextLength() * 24) + "px"; })
            .style("opacity",0)
            .transition()
            .duration(3000)
            .style("opacity",1.0)
            .attr("dy", ".35em");


            var fisheye = d3.fisheye.circular()
            .radius(40)
            .distortion(1)

        svg.on("mousemove", function () {
            fisheye.focus(d3.mouse(this));

            node.each(function (d) {
                d.fisheye = fisheye(d);

            });

             node.selectAll("circle")
                  .attr("cx", function(d) { return d.fisheye.x - d.x; })
                  .attr("cy", function(d) { return d.fisheye.y - d.y; })
                  .attr("r", function(d) { return d.fisheye.z * d.r; });

              node.selectAll("text")
                  .attr("dx", function(d) { return d.fisheye.x - d.x; })

               //   .attr("style", function(d,i){return "font-size:"+ d.fisheye.z * d.r/2.5+"px; text-anchor:middle";})

        });

        node.on("click", function(){
            d3.select(this)
                .style("fill", function(d,i) { return color(i); })
        });
    });
  }
});



// Returns a flattened hierarchy containing all leaf nodes under the root.
function classes(root) {
  var classes = [];

  function recurse(name, node) {
    if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
    else classes.push({packageName: name, className: node.name, value: node.size});
  }

  recurse(null, root);
  return {children: classes};
}



d3.select(self.frameElement).style("height", diameter + "px");

/*var svgWidth =320;
var svgHeight =320;

var dataSet = {value : 40,
              children : [
                  {value : 35},
                  {value : 100},
                  {value : 200}
              ]}

var bubble = d3.layout.pack()
    .size([320,320])
d3.select("#bubble")
    .selectAll("circle")
    .data(bubble.nodes(dataSet))
    .enter()
    .append("circle")
    .attr("r",function(d){return d.r;})
    .attr("cx",function(d,i){return d.x;})
    .attr("cy",function(d,i){return d.y;})*/