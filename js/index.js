function generateId(label) {
    return label
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^\w؀-ۿ_]/g, "");
}

function assignIdsRecursively(nodes) {
    return nodes.map((node) => ({
        ...node,
        id: generateId(node.label),
        children: assignIdsRecursively(node.children || []),
    }));
}


let rawInitial = [];
let childrenDB = {};
let initialChildren = [];
let fullData;
let currentNode;

// 🔹 بارگذاری داده‌ها از فایل JSON
async function loadData() {
    const res = await fetch("data.json");
    const data = await res.json();

    rawInitial = data.rawInitial || [];
    childrenDB = data.childrenDB || {};

    childrenDB = {};
    for (const key in data.childrenDB) {
        const id = generateId(key);
        childrenDB[id] = assignIdsRecursively(data.childrenDB[key]);
    }

    initialChildren = assignIdsRecursively(rawInitial);

    fullData = {
        id: "root",
        label: "هیأت مدیره",
        children: JSON.parse(JSON.stringify(initialChildren)),
    };

    currentNode = fullData;
    initApp(); // اجرای ادامه برنامه بعد از لود
}




const color = d3.scaleOrdinal(d3.schemeTableau10),
    colorMap = {};
const width = 1600,
    height = 800,
    dx = 140,
    dy = 260;

// Text wrapping with center alignment and increased line spacing
function wrapText(text, width) {
    text.each(function () {
        const textEl = d3.select(this);
        const words = textEl.text().split(/\s+/).reverse();
        let word,
            line = [],
            lineNumber = 0;
        const lineHeight = 1.3; // ems
        const y = textEl.attr("y") || 0;
        const dy = parseFloat(textEl.attr("dy")) || 0;
        textEl.text(null);
        let tspan = textEl
            .append("tspan")
            .attr("x", 0)
            .attr("y", y)
            .attr("dy", dy + "em")
            .attr("text-anchor", "middle");
        while ((word = words.pop())) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = textEl
                    .append("tspan")
                    .attr("x", 0)
                    .attr("y", y)
                    .attr("dy", ++lineNumber * lineHeight + dy + "em")
                    .attr("text-anchor", "middle")
                    .text(word);
            }
        }
    });
}

function findPathToNode(node, id, path = []) {
    if (node.id === id) return [...path, node];
    for (const child of node.children || []) {
        const res = findPathToNode(child, id, [...path, node]);
        if (res) return res;
    }
    return null;
}

function loadChildrenIfNeeded(node) {
    if (
        (!node.children || node.children.length === 0) &&
        childrenDB[node.id]
    )
        node.children = childrenDB[node.id];
}

function rebuildPathToNode(id) {
    fullData.children = JSON.parse(JSON.stringify(initialChildren));
    const queue = [fullData];
    while (queue.length) {
        const n = queue.shift();
        loadChildrenIfNeeded(n);
        if (n.id === id) return n;
        (n.children || []).forEach((c) => queue.push(c));
    }
    return fullData;
}

function renderChart(subtree) {
    const container = d3.select("#chart-view");
    container.selectAll("svg").remove();
    const tree = d3.tree().nodeSize([dy, dx]);
    const root = d3.hierarchy(subtree);
    tree(root);

    const levels = {};
    root.descendants().forEach((d) => {
        (levels[d.depth] = levels[d.depth] || []).push(d);
    });
    Object.values(levels).forEach((nodes) => {
        const maxPerRow = 5,
            rowHeight = 90;
        const totalRows = Math.ceil(nodes.length / maxPerRow);
        nodes.forEach((d, i) => {
            const row = Math.floor(i / maxPerRow),
                col = i % maxPerRow;
            const items =
                row === totalRows - 1
                    ? nodes.length % maxPerRow || maxPerRow
                    : maxPerRow;
            const totalW = (items - 1) * dy;
            d.x = col * dy - totalW / 2;
            d.y = d.depth * dx + row * rowHeight;
        });
    });

    const svg = container
        .append("svg")
        .attr("viewBox", [-width / 2, -50, width, height])
        .attr("preserveAspectRatio", "xMidYMin meet");

    svg
        .append("g")
        .attr("fill", "none")
        .attr("stroke-width", 2)
        .selectAll("path")
        .data(root.links())
        .join("path")
        .attr("class", "link")
        .attr("stroke", (d) => {
            const sid = d.source.data.id;
            if (!colorMap[sid]) colorMap[sid] = color(sid);
            return colorMap[sid];
        })
        .attr(
            "d",
            d3
                .linkVertical()
                .x((d) => d.x)
                .y((d) => d.y)
        );

    const node = svg
        .append("g")
        .selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${d.x},${d.y})`)
        .style("cursor", "pointer")
        .on("click", (e, d) => {
            loadChildrenIfNeeded(d.data);
            currentNode = d.data;
            window.location.hash = encodeURIComponent(d.data.id);
            updateBreadcrumb();
            renderChart(currentNode);
            updateTitle(currentNode.label);
        });

    node
        .append("rect")
        .attr("x", -110)
        .attr("y", -30)
        .attr("width", 220)
        .attr("height", 60)
        .attr("rx", 15)
        .attr("ry", 15);
    node
        .append("text")
        .attr("dy", "-0.3em")
        .text((d) => d.data.label)
        .call(wrapText, 200);
}

function updateBreadcrumb() {
    const bc = document.getElementById("breadcrumb");
    bc.innerHTML = "";
    const path = findPathToNode(fullData, currentNode.id) || [];
    path.forEach((n, i) => {
        if (i < path.length - 1) {
            const a = document.createElement("a");
            a.textContent = n.label;
            a.className = "text-blue-600 hover:underline";
            a.onclick = () => {
                currentNode = rebuildPathToNode(n.id);
                window.location.hash = encodeURIComponent(n.id);
                updateBreadcrumb();
                updateTitle(n.label);
                updateView();
            };
            bc.appendChild(a);
            const sep = document.createElement("span");
            sep.textContent = " / ";
            sep.className = "mx-2";
            bc.appendChild(sep);
        } else {
            const span = document.createElement("span");
            span.textContent = n.label;
            span.className = "text-gray-700 font-semibold";
            bc.appendChild(span);
        }
    });
}

function updateTitle(text) {
    document.getElementById("chart-title").textContent = text;
}

function renderList(node) {
    const container = document.getElementById("list-container");
    container.innerHTML = "";
    let counter = 1;

    const table = document.createElement("table");
    table.className = "w-full text-xs border border-collapse border-gray-400";
    table.style.fontSize = "11px";
    table.dir = "rtl";

    let hasName = false;
    let hasType = false;
    let hasOfficial = false;
    let hasContract = false;
    let hasRetired = false;
    let hasPartTime = false;
    let hasTotal = false;

    let sumOfficial = 0, sumContract = 0, sumRetired = 0, sumPartTime = 0, sumTotal = 0;

    function analyzeFields(n) {
        if (n.name) hasName = true;
        if (n.employmentType) hasType = true;
        if (n.counts?.official != null) {
            hasOfficial = true;
            sumOfficial += n.counts.official || 0;
        }
        if (n.counts?.contract != null) {
            hasContract = true;
            sumContract += n.counts.contract || 0;
        }
        if (n.counts?.retired != null) {
            hasRetired = true;
            sumRetired += n.counts.retired || 0;
        }
        if (n.counts?.partTime != null) {
            hasPartTime = true;
            sumPartTime += n.counts.partTime || 0;
        }

        const total = (n.counts?.official || 0) + (n.counts?.contract || 0) + (n.counts?.retired || 0) + (n.counts?.partTime || 0);
        if (total) {
            hasTotal = true;
            sumTotal += total;
        }

        (n.children || []).forEach(analyzeFields);
    }

    analyzeFields(node);

    const headers = ["ردیف", "عنوان"];
    if (hasName) headers.push("نام پرسنل");
    if (hasType) headers.push("نوع استخدام");
    if (hasOfficial) headers.push("نظامی و رسمی");
    if (hasContract) headers.push("قراردادی");
    if (hasRetired) headers.push("بازنشسته");
    if (hasPartTime) headers.push("پاره‌وقت");
    if (hasTotal) headers.push("جمع کل");
    headers.push("اقدامات"); // 🔹 ستون جدید

    const headerRow = document.createElement("tr");
    headers.forEach(h => {
        const th = document.createElement("th");
        th.className = "border border-gray-400 bg-gray-200 p-1 text-center whitespace-nowrap";
        th.textContent = h;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // 🔸 تعریف آدرس صفحات جزئیات بر اساس id گره
    const detailsPages = {
        "modir-mali": "/details/finance.html",
        "modir-ensan": "/details/hr.html",
        "moaven-fanni": "/details/technical.html",
        // گره‌هایی که صفحه دارند
    };

    function walk(n, depth = 0) {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-gray-50 cursor-pointer";

        const counts = n.counts || {};
        const total =
            (counts.official || 0) +
            (counts.contract || 0) +
            (counts.retired || 0) +
            (counts.partTime || 0);

        const values = [
            counter++,
            `${"—".repeat(depth)} ${n.label}`
        ];

        if (hasName) values.push(n.name || "");
        if (hasType) values.push(n.employmentType || "");
        if (hasOfficial) values.push(counts.official ?? 0);
        if (hasContract) values.push(counts.contract ?? 0);
        if (hasRetired) values.push(counts.retired ?? 0);
        if (hasPartTime) values.push(counts.partTime ?? 0);
        if (hasTotal) values.push(total || 0);

        values.forEach(val => {
            const td = document.createElement("td");
            td.className = "border border-gray-300 p-1 text-center whitespace-nowrap";
            td.innerHTML = val;
            tr.appendChild(td);
        });

        // 🔹 ستون اقدامات
        const actionTd = document.createElement("td");
        actionTd.className = "border border-gray-300 p-1 text-center whitespace-nowrap";

        const detailUrl = detailsPages[n.id];
        if (detailUrl) {
            const btn = document.createElement("button");
            btn.textContent = "جزئیات";
            btn.className = "bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs";
            btn.onclick = (e) => {
                e.stopPropagation(); // نذار روی ردیف کلیک بشه
                window.open(detailUrl, "_blank");
            };
            actionTd.appendChild(btn);
        } else {
            actionTd.textContent = "—";
        }

        tr.appendChild(actionTd);

        // ➕ کلیک روی کل ردیف
        tr.onclick = () => {
            loadChildrenIfNeeded(n);
            currentNode = n;
            window.location.hash = encodeURIComponent(n.id);
            updateBreadcrumb();
            updateTitle(n.label);
            updateView();
        };

        table.appendChild(tr);
        (n.children || []).forEach(c => walk(c, depth + 1));
    }

    walk(node);

    // ردیف مجموع
    const sumRow = document.createElement("tr");
    const sumCells = [];

    sumCells.push("", "مجموع کل");
    if (hasName) sumCells.push("");
    if (hasType) sumCells.push("");
    if (hasOfficial) sumCells.push(sumOfficial || 0);
    if (hasContract) sumCells.push(sumContract || 0);
    if (hasRetired) sumCells.push(sumRetired || 0);
    if (hasPartTime) sumCells.push(sumPartTime || 0);
    if (hasTotal) sumCells.push(sumTotal || 0);
    sumCells.push(""); // سلول اقدامات

    sumCells.forEach(val => {
        const td = document.createElement("td");
        td.className = "border border-gray-400 bg-gray-100 p-1 text-center font-bold";
        td.textContent = val;
        sumRow.appendChild(td);
    });

    table.appendChild(sumRow);
    container.appendChild(table);
}

let viewMode = "chart";
const toggleBtn = document.getElementById("toggle-view");
toggleBtn.addEventListener("click", () => {
    viewMode = viewMode === "chart" ? "list" : "chart";
    updateView();
});

function updateView() {
    if (viewMode === "chart") {
        document.getElementById("chart-view").classList.remove("hidden");
        document.getElementById("list-view").classList.add("hidden");
        toggleBtn.textContent = "نمایش لیست";
        renderChart(currentNode);
    } else {
        document.getElementById("chart-view").classList.add("hidden");
        document.getElementById("list-view").classList.remove("hidden");
        toggleBtn.textContent = "نمایش چارت";
        renderList(currentNode);
    }
}

// به‌جای window.load قبلی:
function initApp() {
    const targetId = decodeURIComponent(window.location.hash.slice(1));
    currentNode = targetId ? rebuildPathToNode(targetId) : fullData;
    updateTitle(currentNode.label);
    updateBreadcrumb();
    updateView();
}

window.addEventListener("load", () => {
    loadData();
});