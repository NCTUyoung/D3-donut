const dim = {
    height:300,
    width:300,
    radius:150
};
const cent = {
    x:(dim.width/2+5),
    y:(dim.height/2+5)

};

const svg = d3.select('.canvas')
    .append('svg')
    .attr('width',dim.width+150)
    .attr('height',dim.height+150);

const graph = svg.append('g')
    .attr('transform',`translate(${cent.x},${cent.y})`);

const pie = d3.pie()
    .sort(null)
    .value(d=>d.cost);

const angles = pie([
    { name: 'rent', cost: 500 },
    { name: 'bills', cost: 300 },
    { name: 'gaming', cost: 200 }
]);

const arcPath = d3.arc()
    .outerRadius(dim.radius)
    .innerRadius(dim.radius/2);

const colour = d3.scaleOrdinal(d3['schemeSet3']);




//update function
const update = (data)=>{

    //update color domain
    colour.domain(data.map(item=>item.name));





    //join enhenced data to path elements
    const paths = graph.selectAll('path')
        .data(pie(data));

    paths.exit()
        .transition().duration(750)
        .attrTween("d",arcTweenExit)
        .remove();

    paths.attr("d",arcPath)
        .transition().duration(750)
        .attrTween("d",arcTweenUpdate);





    paths.enter()
        .append('path')
        .attr('class','arc')
        .attr('d',arcPath)
        .attr('stroke','#fff')
        .attr('stroke-width',2)
        .attr('fill',d=>colour(d.data.name))
        .each(function (d) {this._current =d})
        .transition().duration(750)
            .attrTween("d",arcTweenEnter);

};



//data array on firestore
var data = []
db.collection('expenses').onSnapshot(res=>{
   res.docChanges().forEach(change=>{
       const doc = {...change.doc.data(),id:change.doc.id};
       switch (change.type){
           case 'added':
               data.push(doc);
               break;
           case 'modified':
               const index = data.findIndex(item=>item.id == doc.id);
               data[index] = doc;
               break;
           case 'removed':
               data = data.filter(item=>item.id!==doc.id);
               break;
           default:
               break;
       }

   });
    update(data)
});


const arcTweenEnter = (d) =>{
    var i = d3.interpolate(d.startAngle,d.endAngle);

    return function (t) {
        d.endAngle = i(t);
        return arcPath(d);
    }
}

const arcTweenExit = (d) =>{
    var i = d3.interpolate(d.endAngle,d.startAngle);

    return function (t) {
        d.endAngle = i(t);
        return arcPath(d);
    }
}

// use function keyword to allow this
function arcTweenUpdate(d) {
    var i = d3.interpolate(this._current,d);
    this._current = i(1)
    return function (t) {
        return arcPath(i(t));
    }
}