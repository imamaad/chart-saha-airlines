// =======================
// 🔹 توابع کمکی
// =======================
function generateId(label) {
    return label.trim().toLowerCase().replace(/[^\w؀-ۿ]+/g, "_");
}

function assignIdsRecursively(nodes) {
    return nodes.map(node => ({
        ...node,
        id: generateId(node.label),
        children: assignIdsRecursively(node.children || [])
    }));
}

function createCell(content, classes = "border border-gray-300 p-1 text-center") {
    const td = document.createElement("td");
    td.className = classes;
    td.textContent = content;
    return td;
}

function wrapText(text, width) {
    text.each(function () {
        const textEl = d3.select(this);
        const words = textEl.text().split(/\s+/).reverse();
        let word, line = [], lineNumber = 0;
        const lineHeight = 1.3;
        const y = textEl.attr("y") || 0;
        const dy = parseFloat(textEl.attr("dy")) || 0;
        textEl.text(null);
        let tspan = textEl.append("tspan").attr("x",0).attr("y",y).attr("dy",dy+"em").attr("text-anchor","middle");

        while ((word = words.pop())) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = textEl.append("tspan")
                    .attr("x",0).attr("y",y)
                    .attr("dy",++lineNumber*lineHeight + dy + "em")
                    .attr("text-anchor","middle").text(word);
            }
        }
    });
}

// =======================
// 🔹 داده‌ها
// =======================
let rawInitial = [], childrenDB = {}, initialChildren = [], fullData, currentNode;

// =======================
// 🔹 بارگذاری داده‌ها
// =======================
async function loadData() {
    const res = await fetch("data.json");
    const data = await res.json();

    rawInitial = data.rawInitial || [];
    childrenDB = {};
    for (const [key, value] of Object.entries(data.childrenDB || {})) {
        childrenDB[generateId(key)] = assignIdsRecursively(value);
    }

    initialChildren = assignIdsRecursively(rawInitial);

    fullData = {
        id: "root",
        label: "هیأت مدیره",
        children: JSON.parse(JSON.stringify(initialChildren)),
    };

    currentNode = fullData;
    initApp();
}

// =======================
// 🔹 مسیر و بارگذاری فرزندان
// =======================
function findPathToNode(node, id, path = []) {
    if (node.id === id) return [...path, node];
    for (const child of node.children || []) {
        const res = findPathToNode(child, id, [...path, node]);
        if (res) return res;
    }
    return null;
}

function loadChildrenIfNeeded(node) {
    if ((!node.children || node.children.length === 0) && childrenDB[node.id])
        node.children = childrenDB[node.id];
}

function rebuildPathToNode(id) {
    fullData.children = JSON.parse(JSON.stringify(initialChildren));
    const queue = [fullData];
    while(queue.length) {
        const n = queue.shift();
        loadChildrenIfNeeded(n);
        if(n.id === id) return n;
        (n.children || []).forEach(c => queue.push(c));
    }
    return fullData;
}

// =======================
// 🔹 نمودار
// =======================
const color = d3.scaleOrdinal(d3.schemeTableau10), colorMap = {};
const width = 1600, height = 800, dx = 140, dy = 260;

function renderChart(subtree) {
    const container = d3.select("#chart-view");
    container.selectAll("svg").remove();

    const tree = d3.tree().nodeSize([dy, dx]);
    const root = d3.hierarchy(subtree);
    tree(root);

    // مرتب‌سازی برای نمایش چند ردیفی
    const levels = {};
    root.descendants().forEach(d => (levels[d.depth] = levels[d.depth] || []).push(d));
    Object.values(levels).forEach(nodes => {
        const maxPerRow = 5, rowHeight = 90;
        const totalRows = Math.ceil(nodes.length/maxPerRow);
        nodes.forEach((d,i) => {
            const row = Math.floor(i/maxPerRow), col = i%maxPerRow;
            const items = row === totalRows-1 ? nodes.length%maxPerRow || maxPerRow : maxPerRow;
            const totalW = (items-1)*dy;
            d.x = col*dy - totalW/2;
            d.y = d.depth*dx + row*rowHeight;
        });
    });

    const svg = container.append("svg")
        .attr("viewBox",[-width/2,-50,width,height])
        .attr("preserveAspectRatio","xMidYMin meet");

    svg.append("g").attr("fill","none").attr("stroke-width",2)
        .selectAll("path").data(root.links()).join("path")
        .attr("class","link")
        .attr("stroke", d => { if(!colorMap[d.source.data.id]) colorMap[d.source.data.id] = color(d.source.data.id); return colorMap[d.source.data.id]; })
        .attr("d", d3.linkVertical().x(d=>d.x).y(d=>d.y));

    const node = svg.append("g").selectAll("g").data(root.descendants()).join("g")
        .attr("class","node")
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .style("cursor","pointer")
        .on("click", (e,d) => {
            loadChildrenIfNeeded(d.data);
            currentNode = d.data;
            window.location.hash = encodeURIComponent(d.data.id);
            updateBreadcrumb();
            renderChart(currentNode);
            updateTitle(currentNode.label);
        });

    node.append("rect").attr("x",-110).attr("y",-30).attr("width",220).attr("height",60).attr("rx",15).attr("ry",15);
    node.append("text").attr("dy","-0.3em").text(d=>d.data.label).call(wrapText,200);
}

// =======================
// 🔹 Breadcrumb
// =======================
function updateBreadcrumb() {
    const bc = document.getElementById("breadcrumb");
    bc.innerHTML = "";
    const path = findPathToNode(fullData,currentNode.id) || [];
    path.forEach((n,i)=>{
        if(i<path.length-1){
            const a = document.createElement("a");
            a.textContent = n.label;
            a.className="text-blue-600 hover:underline";
            a.onclick = ()=>{currentNode=rebuildPathToNode(n.id); window.location.hash=encodeURIComponent(n.id); updateBreadcrumb(); updateTitle(n.label); updateView();};
            bc.appendChild(a);
            const sep = document.createElement("span"); sep.textContent=" / "; sep.className="mx-2"; bc.appendChild(sep);
        } else {
            const span = document.createElement("span");
            span.textContent = n.label; span.className="text-gray-700 font-semibold";
            bc.appendChild(span);
        }
    });
}

function updateTitle(text){document.getElementById("chart-title").textContent=text;}

// =======================
// 🔹 نمایش لیست
// =======================
const detailsPages = {
    "modir-mali": "/details/finance.html",
    "modir-ensan": "/details/hr.html",
    "moaven-fanni": "/details/technical.html",
};

function renderList(node){
    const container = document.getElementById("list-container");
    container.innerHTML="";
    let counter=1;

    let sum={official:0,contract:0,retired:0,partTime:0,total:0};
    let flags={name:false,type:false,official:false,contract:false,retired:false,partTime:false,total:false};

    function analyze(n){
        if(n.name) flags.name=true;
        if(n.employmentType) flags.type=true;
        const c=n.counts||{};
        if(c.official!=null){flags.official=true; sum.official+=c.official||0;}
        if(c.contract!=null){flags.contract=true; sum.contract+=c.contract||0;}
        if(c.retired!=null){flags.retired=true; sum.retired+=c.retired||0;}
        if(c.partTime!=null){flags.partTime=true; sum.partTime+=c.partTime||0;}
        const total=(c.official||0)+(c.contract||0)+(c.retired||0)+(c.partTime||0);
        if(total){flags.total=true; sum.total+=total;}
        (n.children||[]).forEach(analyze);
    }
    analyze(node);

    const headers=["ردیف","عنوان"];
    if(flags.name) headers.push("نام پرسنل");
    if(flags.type) headers.push("نوع استخدام");
    if(flags.official) headers.push("نظامی و رسمی");
    if(flags.contract) headers.push("قراردادی");
    if(flags.retired) headers.push("بازنشسته");
    if(flags.partTime) headers.push("پاره‌وقت");
    if(flags.total) headers.push("جمع کل");
    headers.push("اقدامات");

    const table=document.createElement("table");
    table.className="w-full text-xs border border-collapse border-gray-400"; table.dir="rtl"; table.style.fontSize="11px";
    const headerRow=document.createElement("tr");
    headers.forEach(h=>headerRow.appendChild(createCell(h,"border border-gray-400 bg-gray-200 p-1 text-center whitespace-nowrap")));
    table.appendChild(headerRow);

    function walk(n,depth=0){
        const tr=document.createElement("tr"); tr.className="hover:bg-gray-50 cursor-pointer";
        const c=n.counts||{};
        const total=(c.official||0)+(c.contract||0)+(c.retired||0)+(c.partTime||0);
        const values=[counter++,"—".repeat(depth)+" "+n.label];
        if(flags.name) values.push(n.name||"");
        if(flags.type) values.push(n.employmentType||"");
        if(flags.official) values.push(c.official||0);
        if(flags.contract) values.push(c.contract||0);
        if(flags.retired) values.push(c.retired||0);
        if(flags.partTime) values.push(c.partTime||0);
        if(flags.total) values.push(total||0);
        values.forEach(v=>tr.appendChild(createCell(v)));
        // actions
        const actionTd=document.createElement("td"); actionTd.className="border border-gray-300 p-1 text-center whitespace-nowrap";
        const url=detailsPages[n.id];
        if(url){
            const btn=document.createElement("button");
            btn.textContent="جزئیات"; btn.className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs";
            btn.onclick=e=>{e.stopPropagation(); window.open(url,"_blank");};
            actionTd.appendChild(btn);
        } else actionTd.textContent="—";
        tr.appendChild(actionTd);
        tr.onclick=()=>{loadChildrenIfNeeded(n); currentNode=n; window.location.hash=encodeURIComponent(n.id); updateBreadcrumb(); updateTitle(n.label); updateView();}
        table.appendChild(tr);
        (n.children||[]).forEach(c=>walk(c,depth+1));
    }

    walk(node);

    // مجموع
    const sumRow=document.createElement("tr");
    const sumVals=["","مجموع کل"];
    if(flags.name) sumVals.push(""); if(flags.type) sumVals.push("");
    if(flags.official) sumVals.push(sum.official); if(flags.contract) sumVals.push(sum.contract);
    if(flags.retired) sumVals.push(sum.retired); if(flags.partTime) sumVals.push(sum.partTime);
    if(flags.total) sumVals.push(sum.total);
    sumVals.push("");
    sumVals.forEach(v=>sumRow.appendChild(createCell(v,"border border-gray-400 bg-gray-100 p-1 text-center font-bold")));
    table.appendChild(sumRow);

    container.appendChild(table);
}

// =======================
// 🔹 حالت نمایش
// =======================
let viewMode="chart";
const toggleBtn=document.getElementById("toggle-view");
toggleBtn.addEventListener("click",()=>{viewMode=viewMode==="chart"?"list":"chart"; updateView();});

function updateView(){
    if(viewMode==="chart"){
        document.getElementById("chart-view").classList.remove("hidden");
        document.getElementById("list-view").classList.add("hidden");
        toggleBtn.textContent="نمایش لیست";
        renderChart(currentNode);
    } else {
        document.getElementById("chart-view").classList.add("hidden");
        document.getElementById("list-view").classList.remove("hidden");
        toggleBtn.textContent="نمایش چارت";
        renderList(currentNode);
    }
}

// =======================
// 🔹 راه‌اندازی برنامه
// =======================
function initApp(){
    const targetId=decodeURIComponent(window.location.hash.slice(1));
    currentNode = targetId ? rebuildPathToNode(targetId) : fullData;
    updateTitle(currentNode.label);
    updateBreadcrumb();
    updateView();
}

window.addEventListener("load",()=>{loadData();});
